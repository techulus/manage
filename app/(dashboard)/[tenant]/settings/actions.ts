"use server";

import { logtoConfig } from "@/app/logto";
import { user } from "@/drizzle/schema";
import { updateUser } from "@/lib/ops/auth";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { signOut } from "@logto/next/server-actions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveUserTimezone(timezone: string) {
	const cookieStore = await cookies();
	cookieStore.set("userTimezone", timezone, {
		path: "/",
		sameSite: "strict",
		maxAge: 60 * 60 * 24 * 365,
	});

	const { userId } = await getOwner();
	await updateUser(userId, { customData: { timezone } });
}

export async function updateUserData(payload: FormData) {
	const { userId, orgSlug } = await getOwner();
	const key = payload.get("key") as string;
	const value = payload.get(key) as string;
	await updateUser(userId, {
		[key]: value,
	});
	revalidatePath(`/${orgSlug}/settings`);

	const db = await database();
	if (key === "name") {
		const [firstName, lastName] = value.split(" ");
		db.update(user)
			.set({ firstName, lastName })
			.where(eq(user.id, userId))
			.run();
	}

	return { success: true };
}

export async function logout() {
	await signOut(logtoConfig);
}
