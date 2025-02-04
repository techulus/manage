"use server";

import { notification, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { broadcastEvent, getStreamFor } from "@/lib/utils/cable-server";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveUserTimezone(timeZone: string) {
	const cookieStore = await cookies();
	cookieStore.set("userTimezone", timeZone, {
		path: "/",
		sameSite: "strict",
		maxAge: 60 * 60 * 24 * 365,
	});

	const { userId } = await getOwner();

	const db = await database();
	db.update(user).set({ timeZone }).where(eq(user.id, userId)).run();
}

export async function getUserNotifications() {
	const { userId } = await getOwner();

	const db = await database();
	const notifications = await db.query.notification.findMany({
		where: eq(notification.toUser, userId),
		with: {
			toUser: true,
			fromUser: true,
		},
		orderBy: desc(notification.createdAt),
	});

	return notifications;
}

export async function markAllNotificationsAsRead() {
	const { orgSlug, userId } = await getOwner();

	const db = await database();
	db.update(notification)
		.set({ read: true })
		.where(eq(notification.toUser, userId))
		.run();

	await broadcastEvent("notifications", userId);
	revalidatePath(`/${orgSlug}/notifications`);
}

export async function getNotificationsStream() {
	const { userId } = await getOwner();
	return getStreamFor("notifications", userId);
}

export async function getSidebarStream() {
	const { ownerId } = await getOwner();
	return getStreamFor("update_sidebar", ownerId);
}
