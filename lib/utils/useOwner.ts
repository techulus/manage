import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { database } from "./useDatabase";
import { auth } from "../auth";
import type { User } from "@/drizzle/types";
import { user } from "@/drizzle/schema";

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

	return {
		ownerId: activeOrgId ?? userId,
		userId,
		orgId: activeOrgId,
		orgSlug: activeOrgId ?? userId,
	} as Result;
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}
