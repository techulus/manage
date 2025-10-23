import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { err, ok, type Result } from "neverthrow";
import type { Database } from "@/drizzle/types";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";

export function getDatabaseName(ownerId: string): Result<string, string> {
	if (!ownerId.startsWith("org_") && !ownerId.startsWith("user_")) {
		return err("Invalid owner ID");
	}
	return ok(ownerId.toLowerCase().replace(/ /g, "_"));
}

export async function database(): Promise<Database> {
	const { ownerId } = await getOwner();
	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	return getDatabaseForOwner(ownerId);
}

export async function getDatabaseForOwner(ownerId: string): Promise<Database> {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => value,
		() => {
			throw new Error("Database name not found");
		},
	);

	return drizzle({
		connection: {
			url: `${process.env.DATABASE_URL}/${databaseName}`,
			ssl: process.env.DATABASE_SSL === "true",
		},
		schema,
	});
}

export async function deleteDatabase(ownerId: string) {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => value,
		() => {
			throw new Error("Database name not found");
		},
	);

	const ownerDb = drizzle({
		connection: {
			url: `${process.env.DATABASE_URL}/${databaseName}`,
			ssl: process.env.DATABASE_SSL === "true",
		},
		schema,
	});

	await ownerDb.execute(sql`
		SELECT pg_terminate_backend(pid)
		FROM pg_stat_activity
		WHERE datname = ${databaseName}
		  AND pid <> pg_backend_pid()
	`);

	await ownerDb.execute(
		sql`DROP DATABASE ${sql.identifier(databaseName)} WITH (FORCE)`,
	);
}
