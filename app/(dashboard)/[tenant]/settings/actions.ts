"use server";

import { updateUser } from "@/lib/ops/auth";
import { getOwner } from "@/lib/utils/useOwner";
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
