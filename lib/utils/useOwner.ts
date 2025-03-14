import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../betterauth/auth";
import { database } from "./useDatabase";

type Organization = {
	id: string;
	name: string;
	slug: string;
	logo: string;
	createdAt: Date;
	meta: Record<string, string | number>;
};

type Result = {
	ownerId: string;
	userId: string;
	orgId: string | null;
	orgSlug: string;
};

export async function getUser(): Promise<User> {
	const session = await auth().api.getSession({
		headers: await headers(),
	});
	if (!session) {
		redirect("/sign-in");
	}

	const db = await database();
	const userDetails = await db.query.user.findFirst({
		where: eq(user.id, session.user.id),
	});

	if (!userDetails) {
		throw new Error("User not found");
	}

	return userDetails;
}

export async function getOwner(): Promise<Result> {
	const session = await auth().api.getSession({
		headers: await headers(),
	});
	if (!session) {
		redirect("/sign-in");
	}

	const userId = session.user.id;
	const activeOrgId = session.session.activeOrganizationId;

	const organization = activeOrgId
		? await auth().api.getFullOrganization({
				headers: await headers(),
				query: {
					organizationId: activeOrgId,
				},
			})
		: null;

	return {
		ownerId: activeOrgId ?? userId,
		userId,
		orgId: activeOrgId,
		orgSlug: organization?.slug ?? "me",
	} as Result;
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}

export async function getOrganizations(): Promise<Organization[]> {
	const organizations = await auth().api.listOrganizations({
		headers: await headers(),
	});
	return organizations as Organization[];
}
