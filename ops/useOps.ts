import type { UserJSON } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./drizzle/schema";
import type { OpsDatabase } from "./drizzle/types";

export async function getOpsDatabase(): Promise<OpsDatabase> {
	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";
	const client = neon(`${process.env.DATABASE_URL}/manage${sslMode}`);
	return drizzle({ client, schema });
}

export async function addUserToOpsDb(userData: UserJSON) {
	if (!userData) {
		throw new Error("No user found");
	}
	if (!userData.email_addresses || userData.email_addresses.length === 0) {
		throw new Error("The user has no associated email addresses.");
	}

	const db = await getOpsDatabase();

	await db
		.insert(schema.opsUser)
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
			target: schema.opsUser.id,
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
