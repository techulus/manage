"use server";

import { notification, user } from "@/drizzle/schema";
import { broadcastEvent, getSignedWireUrl } from "@/lib/utils/turbowire";
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
	db.update(user).set({ timeZone }).where(eq(user.id, userId)).execute();
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
		.execute();

	await broadcastEvent("notifications", userId);
	revalidatePath(`/${orgSlug}/notifications`);
}

export async function getNotificationsWire() {
	const { userId } = await getOwner();
	return getSignedWireUrl("notifications", userId);
}
