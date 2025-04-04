"use server";

import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { currentUser } from "@clerk/nextjs/server";
import { database } from "./useDatabase";
import { getOwner } from "./useOwner";

export async function addUserToTenantDb() {
	const userData = await currentUser();
	if (!userData) {
		throw new Error("No user found");
	}

	if (!userData.emailAddresses || userData.emailAddresses.length === 0) {
		throw new Error("The user has no associated email addresses.");
	}

	const db = await database();
	db.insert(user)
		.values({
			id: userData.id,
			email: userData.emailAddresses[0].emailAddress,
			firstName: userData.firstName,
			lastName: userData.lastName,
			rawData: userData,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: user.id,
			set: {
				email: userData.emailAddresses[0].emailAddress,
				firstName: userData.firstName,
				lastName: userData.lastName,
				rawData: userData,
				updatedAt: new Date(),
			},
		})
		.run();
}

export async function getAllUsers(includeSelf = false): Promise<User[]> {
	const db = await database();
	const { userId } = await getOwner();
	const users: User[] = (await db.query.user.findMany()) ?? [];
	return includeSelf ? users : users.filter((user) => user.id !== userId);
}
