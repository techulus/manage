import {
	notification,
	project,
	user,
} from "@/drizzle/schema";
import type {
	NotificationWithUser,
} from "@/drizzle/types";
import { getTodayDataForUser } from "@/lib/utils/todayData";
import { broadcastEvent, getSignedWireUrl } from "@/lib/utils/turbowire";
import { currentUser } from "@clerk/nextjs/server";
import {
	desc,
	eq,
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
				},
			});

			return projects;
		}),
});
