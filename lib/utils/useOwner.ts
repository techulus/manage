import { auth } from "@/auth";
import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { opsDb } from "@/ops/database";
import { organizationMembers } from "@/ops/schema";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { Organization } from "./../../ops/types";
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
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("User not found");
	}

	const userId = session.user.id;

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
	const { userId } = await getOwner();

	const memberships = await opsDb().query.organizationMembers.findMany({
		where: eq(organizationMembers.userId, userId!),
		with: {
			organization: true,
		},
	});

	return memberships.map((membership) => membership.organization);
}

export async function getOwner(): Promise<Result> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("User not found");
	}

	const userId = session.user.id;

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
