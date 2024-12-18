"use server";

import { signIn, signOut } from "@/auth";
import { getOwner } from "@/lib/utils/useOwner";
import { opsDb } from "@/ops/database";
import { users } from "@/ops/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
	await signIn("resend", formData);
}

export async function switchOrganization(payload: FormData) {
	const orgId = payload.get("id") as string;
	const orgSlug = payload.get("slug") as string;

	if (orgId) {
		(await cookies()).set("activeOrgId", orgId ?? null, {
			httpOnly: true,
		});
		(await cookies()).set("activeOrgSlug", orgSlug ?? "personal", {
			httpOnly: true,
		});
		redirect(`/${orgSlug}/projects`);
	} else {
		(await cookies()).delete("activeOrgId");
		(await cookies()).set("activeOrgSlug", "personal", {
			httpOnly: true,
		});
		redirect("/personal/projects");
	}
}

export async function logout() {
	(await cookies()).delete("activeOrgId");
	(await cookies()).delete("activeOrgSlug");
	await signOut();
	redirect("/");
}

export async function saveUserTimezone(timezone: string) {
	const { userId } = await getOwner();

	await opsDb()
		.update(users)
		.set({
			timezone,
		})
		.where(eq(users.id, userId));

	(await cookies()).set("userTimezone", timezone, {
		httpOnly: true,
	});
}
