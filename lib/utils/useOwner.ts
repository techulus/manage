import { logtoConfig } from "@/app/logto";
import type { Organization } from "@/components/core/auth";
import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { getLogtoContext } from "@logto/next/server-actions";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { database } from "./useDatabase";

dayjs.extend(utc);
dayjs.extend(timezone);

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

export async function getOrgs(): Promise<Organization[]> {
	return [];
}

export async function getOwner(): Promise<Result> {
	const { claims } = await getLogtoContext(logtoConfig);
	if (!claims?.sub) {
		throw new Error("User not found");
	}
	const userId = claims.sub;

	const cookieStore = await cookies();

	const activeOrgId = cookieStore.get("activeOrgId")?.value;
	const activeOrgSlug = cookieStore.get("activeOrgSlug")?.value ?? "personal";
	const ownerId = activeOrgId ?? userId;

	return {
		ownerId,
		userId,
		orgId: activeOrgId,
		orgSlug: activeOrgSlug,
	} as Result;
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return cookieStore.get("userTimezone")?.value ?? dayjs.tz.guess();
}
