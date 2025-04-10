"use server";

import { user } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
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
