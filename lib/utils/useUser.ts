import type { currentUser } from "@clerk/nextjs/server";
import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { database } from "./useDatabase";
import { getOwner } from "./useOwner";

export async function addUserToTenantDb(
	userData?: Awaited<ReturnType<typeof currentUser>>,
) {
	if (!userData) {
		throw new Error("No user found");
	}

	if (!userData.emailAddresses || userData.emailAddresses.length === 0) {
		throw new Error("The user has no associated email addresses.");
	}

	const db = await database();

	await db
		.insert(user)
		.values({
			id: userData.id,
			email: userData.emailAddresses?.[0].emailAddress,
			firstName: userData.firstName,
			lastName: userData.lastName,
			imageUrl: userData.imageUrl,
			rawData: userData,
			lastActiveAt: new Date(),
		})
		.onConflictDoUpdate({
			target: user.id,
			set: {
				email: userData.emailAddresses?.[0].emailAddress,
				firstName: userData.firstName,
				lastName: userData.lastName,
				imageUrl: userData.imageUrl,
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
