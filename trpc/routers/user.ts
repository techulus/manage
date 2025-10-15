import { currentUser } from "@clerk/nextjs/server";
import { desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import {
	notification,
	project,
	projectPermission,
	user,
} from "@/drizzle/schema";
import type { NotificationWithUser } from "@/drizzle/types";
import { getTodayDataForUser } from "@/lib/utils/todayData";
import { broadcastEvent, getSignedWireUrl } from "@/lib/utils/turbowire";
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
		return getTodayDataForUser(ctx.db, ctx.timezone);
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
					permissions: {
						where: eq(projectPermission.userId, ctx.userId),
						columns: {
							role: true,
						},
					},
				},
			});

			if (ctx.isOrgAdmin) {
				return projects.map((proj) => ({
					...proj,
					userRole:
						proj.permissions[0]?.role ||
						(proj.createdByUser === ctx.userId ? "editor" : "editor"),
				}));
			}

			const userProjects = projects.filter(
				(proj) =>
					proj.permissions.length > 0 || proj.createdByUser === ctx.userId,
			);

			return userProjects.map((proj) => ({
				...proj,
				userRole:
					proj.permissions[0]?.role ||
					(proj.createdByUser === ctx.userId ? "editor" : undefined),
			}));
		}),
	searchUsersForMention: protectedProcedure
		.input(
			z.object({
				query: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const users = await ctx.db.query.user.findMany({
				columns: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					imageUrl: true,
				},
			});

			if (input.query) {
				const query = input.query.toLowerCase();
				return users.filter((user) => {
					const fullName =
						`${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
					const email = user.email.toLowerCase();
					return fullName.includes(query) || email.includes(query);
				});
			}

			return users;
		}),
});
