import path from "node:path";
import { createClient } from "@libsql/client/web";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../drizzle/schema";
import {
	getDatabaseForOwner,
	getDatabaseNameForOwner,
	tursoOrganizationName,
} from "./turso";
import { getOwner } from "./useOwner";

export async function isDatabaseReady(): Promise<boolean> {
	try {
		await migrateDatabase();
		return true;
	} catch (e) {
		console.error("Database not ready", e);
		return false;
	}
}

export async function migrateDatabase(): Promise<void> {
	const { ownerId } = await getOwner();
	const db = getDatabaseForOwner(ownerId);
	const migrationsFolder = path.resolve(process.cwd(), "drizzle");
	await migrate(db, { migrationsFolder: migrationsFolder });
}

export async function database(): Promise<LibSQLDatabase<typeof schema>> {
	const { ownerId } = await getOwner();

	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	const databaseName = getDatabaseNameForOwner(ownerId);
	const databaseUrl = `libsql://${databaseName}-${tursoOrganizationName}.turso.io`;

	const client = createClient({
		url: databaseUrl,
		authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
	});

	return drizzle(client, { schema });
}
