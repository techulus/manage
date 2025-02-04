import { user } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { auth } from "../auth";
import { headers } from "next/headers";

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
