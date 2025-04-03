import path from "node:path";
import { createClient } from "@libsql/client";
import { createClient as createTursoClient } from "@tursodatabase/api";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";
import { addUserToTenantDb } from "./useUser";

function getDatabaseName(ownerId: string) {
	return `${ownerId}-${process.env.TURSO_GROUP}`.toLowerCase();
}

export async function isDatabaseReady(): Promise<boolean> {
	const turso = createTursoClient({
		org: process.env.TURSO_ORG!,
		token: process.env.TURSO_API_TOKEN!,
	});

	try {
		const { ownerId } = await getOwner();

		const database = await turso.databases
			.get(getDatabaseName(ownerId))
			.catch(() => null);
		if (!database) {
			await turso.databases.create(getDatabaseName(ownerId), {
				group: process.env.TURSO_GROUP!,
			});
		}

		await migrateDatabase();
		await addUserToTenantDb();
		return true;
	} catch (e) {
		console.error("Database not ready", e);
		return false;
	}
}

async function migrateDatabase(): Promise<void> {
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

export async function getDatabaseForOwner(
	ownerId: string,
): Promise<LibSQLDatabase<typeof schema>> {
	const client = createClient({
		url: `libsql://${getDatabaseName(ownerId)}-${process.env.TURSO_ORG}.turso.io`,
		authToken: process.env.TURSO_GROUP_TOKEN,
	});

	return drizzle(client, { schema });
}
