"use server";

import type { User } from "@/drizzle/types";
import { database } from "./useDatabase";
import { getOwner } from "./useOwner";
import { getOrganizationsForUser, type Organization } from "../ops/auth";

export async function allUsers(includeSelf = false): Promise<User[]> {
	const db = await database();
	const { userId } = await getOwner();
	const users: User[] = (await db.query.user.findMany()) ?? [];
	return includeSelf ? users : users.filter((user) => user.id !== userId);
}

export async function getUserOrganizations(): Promise<Organization[]> {
	const { userId } = await getOwner();
	return getOrganizationsForUser(userId);
}
