import type { UserJSON } from "@clerk/nextjs/server";
import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { database } from "./useDatabase";
import { getOwner } from "./useOwner";

export async function addUserToTenantDb(userData: UserJSON) {
	if (!userData) {
		throw new Error("No user found");
	}

	if (!userData.email_addresses || userData.email_addresses.length === 0) {
		throw new Error("The user has no associated email addresses.");
	}

	const db = await database();

	await db
		.insert(user)
		.values({
			id: userData.id,
			email: userData.email_addresses?.[0].email_address,
			firstName: userData.first_name,
			lastName: userData.last_name,
			imageUrl: userData.image_url,
			rawData: userData,
			lastActiveAt: new Date(),
		})
		.onConflictDoUpdate({
			target: user.id,
			set: {
				email: userData.email_addresses?.[0].email_address,
				firstName: userData.first_name,
				lastName: userData.last_name,
				imageUrl: userData.image_url,
				rawData: userData,
				lastActiveAt: new Date(),
			},
		})
		.execute();
}

export async function getAllUsers(includeSelf = false): Promise<User[]> {
	const db = await database();
	const { userId } = await getOwner();
	const users: User[] = (await db.query.user.findMany()) ?? [];
	return includeSelf ? users : users.filter((user) => user.id !== userId);
}
