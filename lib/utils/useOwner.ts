import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
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
	organizations: Organization[];
};

export async function getUser(): Promise<User> {
	const session = await auth().api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("User not authenticated");
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
		throw new Error("User not authenticated");
	}
	const userId = session.user.id;
	const activeOrgId = session.session.activeOrganizationId;

	const organizations = await auth().api.listOrganizations({
		headers: await headers(),
	});
	const orgSlug = organizations.find((org) => org.id === activeOrgId)?.slug;

	return {
		ownerId: activeOrgId ?? userId,
		userId,
		orgId: activeOrgId,
		orgSlug: orgSlug ?? "me",
		organizations,
	} as Result;
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}
