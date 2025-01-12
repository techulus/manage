import { logtoConfig } from "@/app/logto";
import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { getLogtoContext } from "@logto/next/server-actions";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { database } from "./useDatabase";

type Result = {
	ownerId: string;
	userId: string;
	orgId: string | null;
	orgSlug: string;
};

export async function getUser(): Promise<User> {
	const { claims } = await getLogtoContext(logtoConfig);
	if (!claims?.sub) {
		throw new Error("User not found");
	}
	const userId = claims.sub;

	const db = await database();
	const userDetails = await db.query.user.findFirst({
		where: eq(user.id, userId),
	});

	if (!userDetails) {
		throw new Error("User not found");
	}

	return userDetails;
}

export async function getOwner(): Promise<Result> {
	const { claims } = await getLogtoContext(logtoConfig);
	if (!claims?.sub) {
		throw new Error("User not found");
	}

	const userId = claims.sub;
	const organizationIds = claims.organizations ?? [];

	const cookieStore = await cookies();

	const activeOrgId = organizationIds.find(
		(id) => id === cookieStore.get("activeOrgId")?.value,
	);

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
