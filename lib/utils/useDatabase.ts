import { sql } from "drizzle-orm";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/node-postgres";
import { err, ok, type Result } from "neverthrow";
import { cache } from "react";
import type { Database } from "@/drizzle/types";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";

export function getDatabaseName(ownerId: string): Result<string, string> {
	if (!ownerId.startsWith("org_") && !ownerId.startsWith("user_")) {
		return err("Invalid owner ID");
	}
	return ok(ownerId.toLowerCase().replace(/ /g, "_"));
}

export const database = cache(async (): Promise<Database> => {
	const { ownerId } = await getOwner();
	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	return getDatabaseForOwner(ownerId);
});

export async function getDatabaseForOwner(ownerId: string): Promise<Database> {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => value,
		() => {
			throw new Error("Database name not found");
		},
	);

	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";

	const tenantDb = drizzle(
		`${process.env.DATABASE_URL}/${databaseName}${sslMode}`,
		{
		cache: upstashCache({
			url: process.env.UPSTASH_REDIS_REST_URL!,
			token: process.env.UPSTASH_REDIS_REST_TOKEN!,
			global: true,
		}),
		schema,
		},
	);

	return tenantDb;
}

export async function deleteDatabase(ownerId: string) {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => value,
		() => {
			throw new Error("Database name not found");
		},
	);

	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";

	const ownerDb = drizzle(`${process.env.DATABASE_URL}/manage${sslMode}`, {
		schema,
	});

	// Terminate all connections to the database before dropping
	await ownerDb.execute(sql`
		SELECT pg_terminate_backend(pid)
		FROM pg_stat_activity
		WHERE datname = ${databaseName}
		  AND pid <> pg_backend_pid()
	`);

	// Drop the database with FORCE option (PostgreSQL 13+)
	await ownerDb.execute(
		sql`DROP DATABASE ${sql.identifier(databaseName)} WITH (FORCE)`,
	);
}
