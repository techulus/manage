import { attachDatabasePool } from "@vercel/functions";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { err, ok, type Result } from "neverthrow";
import { Pool } from "pg";
import type { Database } from "@/drizzle/types";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";

const poolInstances = new Map<string, Pool>();

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

	if (!poolInstances.has(ownerId)) {
		const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";
		const connectionString = `${process.env.DATABASE_URL}/${databaseName}${sslMode}`;

		const pool = new Pool({
			connectionString,
			min: 1,
			idleTimeoutMillis: 5000,
			connectionTimeoutMillis: 5000,
		});

		attachDatabasePool(pool);
		poolInstances.set(ownerId, pool);
	}

	return drizzle(poolInstances.get(ownerId)!, { schema });
}

export async function deleteDatabase(ownerId: string) {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => value,
		() => {
			throw new Error("Database name not found");
		},
	);

	const pool = poolInstances.get(ownerId);
	if (pool) {
		await pool.end();
		poolInstances.delete(ownerId);
	}

	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";
	const managePool = new Pool({
		connectionString: `${process.env.DATABASE_URL}/manage${sslMode}`,
		min: 1,
		idleTimeoutMillis: 5000,
		connectionTimeoutMillis: 5000,
	});

	const ownerDb = drizzle(managePool, { schema });

	await ownerDb.execute(sql`
		SELECT pg_terminate_backend(pid)
		FROM pg_stat_activity
		WHERE datname = ${databaseName}
		  AND pid <> pg_backend_pid()
	`);

	await ownerDb.execute(
		sql`DROP DATABASE ${sql.identifier(databaseName)} WITH (FORCE)`,
	);

	await managePool.end();
}
