import path from "node:path";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import * as opsSchema from "../ops/drizzle/schema";

function getDatabaseName(ownerId: string): string {
	return ownerId.toLowerCase().replace(/ /g, "_");
}

function maskId(id: string): string {
	if (id.length <= 8) return "***";
	return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function sanitizeError(error: string, tenantId: string): string {
	const databaseName = getDatabaseName(tenantId);
	return error
		.replaceAll(tenantId, maskId(tenantId))
		.replaceAll(databaseName, "tenant_db");
}

async function getOpsDatabase() {
	const client = postgres(`${process.env.DATABASE_URL}/manage`, {
		ssl: process.env.DATABASE_SSL === "true" ? "require" : false,
		max: 1,
	});

	return {
		db: drizzle({ client, schema: opsSchema }),
		client,
	};
}

async function getAllTenantIds(
	opsDb: ReturnType<typeof drizzle<typeof opsSchema>>,
): Promise<string[]> {
	const [users, organizations] = await Promise.all([
		opsDb.select({ id: opsSchema.opsUser.id }).from(opsSchema.opsUser),
		opsDb
			.select({ id: opsSchema.opsOrganization.id })
			.from(opsSchema.opsOrganization),
	]);

	const tenantIds = [
		...users.map((u) => u.id),
		...organizations.map((o) => o.id),
	];

	return tenantIds;
}

async function migrateTenantDatabase(
	ownerId: string,
	opsDb: ReturnType<typeof drizzle<typeof opsSchema>>,
): Promise<{
	success: boolean;
	skipped?: boolean;
	error?: string;
}> {
	let tenantClient: ReturnType<typeof postgres> | null = null;

	try {
		const databaseName = getDatabaseName(ownerId);

		const checkDb = await opsDb.execute(
			sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`,
		);

		if (checkDb.count === 0) {
			return { success: true, skipped: true };
		}

		tenantClient = postgres(`${process.env.DATABASE_URL}/${databaseName}`, {
			ssl: process.env.DATABASE_SSL === "true" ? "require" : false,
			max: 1,
		});

		const tenantDb = drizzle({ client: tenantClient, schema });

		const migrationsFolder = path.resolve(process.cwd(), "drizzle");
		await migrate(tenantDb, { migrationsFolder });

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	} finally {
		if (tenantClient) {
			await tenantClient.end();
		}
	}
}

async function main() {
	console.log("Starting tenant database migrations...\n");

	if (!process.env.DATABASE_URL) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	const { db: opsDb, client: opsClient } = await getOpsDatabase();

	try {
		const tenantIds = await getAllTenantIds(opsDb);
		console.log(`Found ${tenantIds.length} tenant(s) to migrate\n`);

		if (tenantIds.length === 0) {
			console.log("No tenants found. Nothing to migrate.");
			return;
		}

		let successCount = 0;
		let skippedCount = 0;
		let failureCount = 0;
		const failures: Array<{ tenantId: string; error: string }> = [];

		for (let i = 0; i < tenantIds.length; i++) {
			const tenantId = tenantIds[i];
			const maskedId = maskId(tenantId);
			const progress = `[${i + 1}/${tenantIds.length}]`;
			process.stdout.write(`${progress} Migrating ${maskedId}... `);

			const result = await migrateTenantDatabase(tenantId, opsDb);

			if (result.success) {
				if (result.skipped) {
					console.log("⊘ (no database)");
					skippedCount++;
				} else {
					console.log("✓");
					successCount++;
				}
			} else {
				console.log("✗");
				const sanitizedError = sanitizeError(
					result.error || "Unknown error",
					tenantId,
				);
				console.log(`  Error: ${sanitizedError}`);
				failureCount++;
				failures.push({ tenantId: maskedId, error: sanitizedError });
			}
		}

		console.log(`\n${"=".repeat(60)}`);
		console.log("Migration Summary:");
		console.log(`  Total: ${tenantIds.length}`);
		console.log(`  Success: ${successCount}`);
		console.log(`  Skipped: ${skippedCount} (no database created yet)`);
		console.log(`  Failed: ${failureCount}`);

		if (failures.length > 0) {
			console.log("\nFailed migrations:");
			for (const failure of failures) {
				console.log(`  - ${failure.tenantId}: ${failure.error}`);
			}
			console.log("\n✗ Some migrations failed!");
			process.exit(1);
		}

		console.log("\n✓ All tenant databases migrated successfully!");
		process.exit(0);
	} finally {
		await opsClient.end();
	}
}

main().catch((error) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const sanitized = errorMessage
		.replace(/user_[a-zA-Z0-9]+/g, "user_***")
		.replace(/org_[a-zA-Z0-9]+/g, "org_***");
	console.error("Fatal error:", sanitized);
	process.exit(1);
});
