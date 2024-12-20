import path from "node:path";
import Database from "better-sqlite3";
import {
	type BetterSQLite3Database,
	drizzle,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../../drizzle/schema";
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
	const db = await database();
	const migrationsFolder = path.resolve(process.cwd(), "drizzle");
	migrate(db, { migrationsFolder: migrationsFolder });
}

export async function database(): Promise<
	BetterSQLite3Database<typeof schema>
> {
	const { ownerId } = await getOwner();

	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	const sqlite = new Database(`sqlite/${ownerId}.db`);
	return drizzle(sqlite, { schema });
}

export async function getDatabaseForOwner(
	ownerId: string,
): Promise<BetterSQLite3Database<typeof schema>> {
	const sqlite = new Database(`sqlite/${ownerId}.db`);
	return drizzle(sqlite, { schema });
}
