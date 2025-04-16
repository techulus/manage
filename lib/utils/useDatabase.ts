import path from "node:path";
import { sql } from "drizzle-orm";
import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";
import { addUserToTenantDb } from "./useUser";

function getDatabaseName(ownerId: string) {
	return ownerId.toLowerCase().replace(/ /g, "_");
}

export async function isDatabaseReady(): Promise<boolean> {
	try {
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
	await migrate(db, { migrationsFolder: migrationsFolder });
}

export async function database(): Promise<NodePgDatabase<typeof schema>> {
	const { ownerId } = await getOwner();
	if (!ownerId) {
		throw new Error("Owner ID not found");
	}

	return getDatabaseForOwner(ownerId);
}

export async function getDatabaseForOwner(
	ownerId: string,
): Promise<NodePgDatabase<typeof schema>> {
	const databaseName = getDatabaseName(ownerId);

	const ownerDb = drizzle(
		`${process.env.DATABASE_URL}/manage?sslmode=require`,
		{
			schema,
		},
	);

	const checkDb = await ownerDb.execute(
		sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`,
	);
	if (checkDb.rowCount === 0) {
		await ownerDb.execute(sql`CREATE DATABASE ${sql.identifier(databaseName)}`);
	}

	const tenantDb = drizzle(
		`${process.env.DATABASE_URL}/${databaseName}?sslmode=require`,
		{
			schema,
		},
	);

	return tenantDb;
}

export async function deleteDatabase(ownerId: string) {
	const databaseName = getDatabaseName(ownerId);

	const ownerDb = drizzle(
		`${process.env.DATABASE_URL}/manage?sslmode=require`,
		{
			schema,
		},
	);

	await ownerDb.execute(sql`DROP DATABASE ${sql.identifier(databaseName)}`);
}
