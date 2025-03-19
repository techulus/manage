import path from "node:path";
import { createClient } from "@libsql/client";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";
import { addUserToTenantDb } from "./useUser";

function getDatabaseName(ownerId: string) {
	return `${ownerId}-${process.env.TURSO_GROUP}`.toLowerCase();
}

export async function isDatabaseReady(): Promise<boolean> {
	try {
		const { ownerId } = await getOwner();
		const result = await fetch(
			`https://api.turso.tech/v1/organizations/${process.env.TURSO_ORG}/databases`,
			{
				method: "POST",
				body: JSON.stringify({
					name: getDatabaseName(ownerId),
					group: process.env.TURSO_GROUP,
				}),
				headers: {
					Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
				},
			},
		).then((res) => res.json());
		if (result?.error && !result.error?.includes("already exists")) {
			console.error("Error creating Turso DB", result.error);
			return false;
		}
		await migrateDatabase();
		await addUserToTenantDb();
		return true;
	} catch (e) {
		console.error("Database not ready", e);
		return false;
	}
}

export async function migrateDatabase(): Promise<void> {
	const db = await database();
	const migrationsFolder = path.resolve(process.cwd(), "drizzle");
	migrate(db, { migrationsFolder: migrationsFolder });
}

export async function database(): Promise<LibSQLDatabase<typeof schema>> {
	const { ownerId } = await getOwner();

	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	return getDatabaseForOwner(ownerId);
}

export function getDatabaseForOwner(
	ownerId: string,
): LibSQLDatabase<typeof schema> {
	return drizzle(
		createClient({
			url: `libsql://${getDatabaseName(ownerId)}-${process.env.TURSO_ORG}.turso.io`,
			authToken: process.env.TURSO_GROUP_TOKEN,
		}),
		{ schema },
	);
}
