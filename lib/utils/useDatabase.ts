import path from "node:path";
import { addUserToOpsDb } from "@/ops/useOps";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../../drizzle/schema";
import type { Database } from "@/drizzle/types";
import { getOwner } from "./useOwner";
import { addUserToTenantDb } from "./useUser";

function getDatabaseName(ownerId: string) {
	if (!ownerId.startsWith("org_") && !ownerId.startsWith("user_")) {
		throw new Error("Invalid owner ID");
	}
	return ownerId.toLowerCase().replace(/ /g, "_");
}

export async function isDatabaseReady(): Promise<boolean> {
	try {
		await migrateDatabase();
		await addUserToTenantDb();
		addUserToOpsDb()
			.then(() => {
				console.log("User added to ops database");
			})
			.catch((error) => {
				console.error("Failed to add user to ops database", error);
			});
		return true;
	} catch (e) {
		console.error("Database not ready", e);
		return false;
	}
}

async function migrateDatabase(): Promise<void> {
	const db = await database();
	const migrationsFolder = path.resolve(process.cwd(), "drizzle");
	await migrate(db, { migrationsFolder: migrationsFolder });
}

export async function database(): Promise<Database> {
	const { ownerId } = await getOwner();
	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	return getDatabaseForOwner(ownerId);
}

export async function getDatabaseForOwner(
	ownerId: string,
): Promise<Database> {
	const databaseName = getDatabaseName(ownerId);
	if (!databaseName) {
		throw new Error("Database name not found");
	}

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
			schema,
		},
	);

	return tenantDb;
}

export async function deleteDatabase(ownerId: string) {
	const databaseName = getDatabaseName(ownerId);
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
	await ownerDb.execute(sql`DROP DATABASE ${sql.identifier(databaseName)} WITH (FORCE)`);
}
