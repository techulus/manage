"use server";

import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { headers } from "next/headers";
import { auth } from "../betterauth/auth";
import { database } from "./useDatabase";
import { getOwner } from "./useOwner";

export async function addUserToTenantDb() {
	const db = await database();
	const session = await auth().api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("No session found");
	}

	db.insert(user)
		.values({
			id: session.user.id,
			email: session.user.email,
			firstName: session.user.name.split(" ")[0],
			lastName: session.user.name.split(" ")[1],
			rawData: session.user,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: user.id,
			set: {
				email: session.user.email,
				firstName: session.user.name.split(" ")[0],
				lastName: session.user.name.split(" ")[1],
				rawData: session.user,
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
