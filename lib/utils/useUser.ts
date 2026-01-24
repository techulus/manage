import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { database } from "./useDatabase";
import { getOwner } from "./useOwner";

export async function getAllUsers(includeSelf = false): Promise<User[]> {
	const db = database();
	const { userId } = await getOwner();
	const users: User[] = (await db.query.user.findMany()) ?? [];
	return includeSelf ? users : users.filter((user) => user.id !== userId);
}
