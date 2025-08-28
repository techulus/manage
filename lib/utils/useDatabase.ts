import path from "node:path";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { err, ok, type Result, ResultAsync } from "neverthrow";
import type { Database } from "@/drizzle/types";
import { addUserToOpsDb } from "@/ops/useOps";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";
import { addUserToTenantDb } from "./useUser";

const connectionPool = new Map<string, Database>();
const connectionTimestamps = new Map<string, number>();

function handleError(message: string) {
	return (error: unknown) => {
		console.error(message, error);
		return false;
	};
}

function getDatabaseName(ownerId: string): Result<string, string> {
	if (!ownerId.startsWith("org_") && !ownerId.startsWith("user_")) {
		return err("Invalid owner ID");
	}
	return ok(ownerId.toLowerCase().replace(/ /g, "_"));
}

export async function isDatabaseReady(): Promise<boolean> {
	try {
		const migrationResult = await migrateDatabase();

		if (!migrationResult) {
			return false;
		}

		const userData = await currentUser();
		if (!userData) {
			throw new Error("No user found");
		}

		await Promise.all([addUserToTenantDb(userData), addUserToOpsDb(userData)]);

		return true;
	} catch (error) {
		console.error("Database setup failed:", error);
		return false;
	}
}

async function migrateDatabase(): Promise<boolean> {
	const dbResult = await ResultAsync.fromPromise(
		database(),
		handleError("Failed to get database"),
	);

	if (dbResult.isErr()) {
		return false;
	}

	const db = dbResult.value;
	const migrationsFolder = path.resolve(process.cwd(), "drizzle");

	const migrateResult = await ResultAsync.fromPromise(
		migrate(db, { migrationsFolder: migrationsFolder }),
		handleError("Failed to migrate database"),
	);

	return migrateResult.match(
		() => true,
		() => false,
	);
}

export async function database(): Promise<Database> {
	const { ownerId } = await getOwner();
	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	return getDatabaseForOwner(ownerId);
}

export async function getDatabaseForOwner(ownerId: string): Promise<Database> {
	const cachedConnection = connectionPool.get(ownerId);
	if (cachedConnection) {
		connectionTimestamps.set(ownerId, Date.now());
		return cachedConnection;
	}

	const databaseName = getDatabaseName(ownerId).match(
		(value) => {
			return value;
		},
		() => {
			throw new Error("Database name not found");
		},
	);

	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";

	const ownerDb = drizzle(`${process.env.DATABASE_URL}/manage${sslMode}`, {
		schema,
	});

	const checkDb = await ownerDb.execute(
		sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`,
	);
	if (checkDb.rowCount === 0) {
		await ownerDb.execute(sql`CREATE DATABASE ${sql.identifier(databaseName)}`);
	}

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

	connectionPool.set(ownerId, tenantDb);
	connectionTimestamps.set(ownerId, Date.now());

	return tenantDb;
}

export async function deleteDatabase(ownerId: string) {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => {
			return value;
		},
		() => {
			throw new Error("Database name not found");
		},
	);

	connectionPool.delete(ownerId);
	connectionTimestamps.delete(ownerId);

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
