import { notification, project, user } from "@/drizzle/schema";
import type { NotificationWithUser } from "@/drizzle/types";
import { getSignedWireUrl } from "@/lib/utils/turbowire";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const userRouter = createTRPCRouter({
	getCurrentUser: baseProcedure.query(async ({ ctx }) => {
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
	getNotificationsWire: baseProcedure.query(async ({ ctx }) => {
		return getSignedWireUrl("notifications", ctx.userId);
	}),
	getUserNotifications: baseProcedure.query(async ({ ctx }) => {
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
	getProjects: baseProcedure
		.input(
			z
				.object({
					statuses: z.array(z.string()).optional(),
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const statuses = input?.statuses ?? ["active"];
			const search = input?.search;

			const statusFilter = statuses?.map((status) =>
				eq(project.status, status),
			);

			const projects = await ctx.db.query.project.findMany({
				where: search
					? and(like(project.name, `%${search}%`), or(...statusFilter))
					: and(or(...statusFilter)),
				with: {
					creator: true,
				},
			});

			return projects;
		}),
});
