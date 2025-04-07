import { notification, user } from "@/drizzle/schema";
import type { NotificationWithUser } from "@/drizzle/types";
import { getSignedWireUrl } from "@/lib/utils/turbowire";
import { getProjectsForOwner } from "@/lib/utils/useProjects";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
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
	getProjects: baseProcedure.query(async () => {
		const { projects } = await getProjectsForOwner({
			statuses: ["active"],
		});

		return projects ?? [];
	}),
});
