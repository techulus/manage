"use server";

import { updateUser } from "@/lib/ops/auth";
import { getOwner } from "@/lib/utils/useOwner";
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
	return { success: true };
}
