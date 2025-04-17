import {
	calendarEvent,
	notification,
	project,
	task,
	user,
} from "@/drizzle/schema";
import type { NotificationWithUser } from "@/drizzle/types";
import { broadcastEvent, getSignedWireUrl } from "@/lib/utils/turbowire";
import {
	filterByRepeatRule,
	getStartEndDateRangeInUtc,
} from "@/lib/utils/useEvents";
import { currentUser } from "@clerk/nextjs/server";
import {
	and,
	asc,
	between,
	desc,
	eq,
	gt,
	isNotNull,
	lt,
	ne,
	or,
} from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		const userData = await currentUser();
		if (!userData) {
			throw new Error("User not found");
		}

		const userDetails = await ctx.db.query.user.findFirst({
			where: eq(user.id, userData.id),
		});
		if (!userDetails) {
			throw new Error("User not found");
		}

		return userDetails;
	}),
	getNotificationsWire: protectedProcedure.query(async ({ ctx }) => {
		return getSignedWireUrl("notifications", ctx.userId);
	}),
	getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
		const notifications = await ctx.db.query.notification.findMany({
			where: eq(notification.toUser, ctx.userId),
			with: {
				toUser: true,
				fromUser: true,
			},
			orderBy: desc(notification.createdAt),
		});

		return notifications as NotificationWithUser[];
	}),
	markNotificationsAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(notification)
			.set({ read: true })
			.where(eq(notification.toUser, ctx.userId))
			.execute();
		await broadcastEvent("notifications", ctx.userId);
	}),
	getTodayData: protectedProcedure.query(async ({ ctx }) => {
		const today = new Date();
		const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(
			ctx.timezone,
			today,
		);

		const [tasksDueToday, overDueTasks, events] = await Promise.all([
			ctx.db.query.task.findMany({
				where: and(
					between(task.dueDate, startOfDay, endOfDay),
					ne(task.status, "done"),
					isNotNull(task.dueDate),
				),
				orderBy: [asc(task.position)],
				columns: {
					name: true,
					dueDate: true,
					id: true,
				},
				with: {
					taskList: {
						columns: {
							id: true,
							status: true,
							name: true,
						},
						with: {
							project: {
								columns: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			}),
			ctx.db.query.task.findMany({
				where: and(
					lt(task.dueDate, startOfDay),
					ne(task.status, "done"),
					isNotNull(task.dueDate),
				),
				orderBy: [asc(task.position)],
				columns: {
					name: true,
					dueDate: true,
					id: true,
				},
				with: {
					taskList: {
						columns: {
							id: true,
							status: true,
							name: true,
						},
						with: {
							project: {
								columns: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			}),
			ctx.db.query.calendarEvent.findMany({
				where: and(
					or(
						between(calendarEvent.start, startOfDay, endOfDay),
						between(calendarEvent.end, startOfDay, endOfDay),
						and(
							lt(calendarEvent.start, startOfDay),
							gt(calendarEvent.end, endOfDay),
						),
						isNotNull(calendarEvent.repeatRule),
						eq(calendarEvent.start, startOfDay),
						eq(calendarEvent.end, endOfDay),
					),
				),
				orderBy: [desc(calendarEvent.start), asc(calendarEvent.allDay)],
				with: {
					project: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			}),
		]);

		const dueToday = tasksDueToday.filter(
			(t) => t.taskList?.status !== "archived",
		);

		const overDue = overDueTasks.filter(
			(t) => t.taskList?.status !== "archived",
		);

		const filteredEvents = events.filter((event) =>
			filterByRepeatRule(event, new Date(today), ctx.timezone),
		);

		return {
			dueToday,
			overDue,
			events: filteredEvents,
		};
	}),
	getProjects: protectedProcedure
		.input(
			z
				.object({
					statuses: z.array(z.string()).optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const statuses = input?.statuses ?? ["active"];

			const statusFilter = statuses?.map((status) =>
				eq(project.status, status),
			);

			const projects = await ctx.db.query.project.findMany({
				where: or(...statusFilter),
				with: {
					creator: true,
				},
			});

			return projects;
		}),
});
