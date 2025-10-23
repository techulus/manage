import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as opsSchema from "../ops/drizzle/schema";

async function migrateOpsDatabase(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const opsDb = drizzle({
			connection: {
				url: `${process.env.DATABASE_URL}/manage`,
				ssl: process.env.DATABASE_SSL === "true",
			},
			schema: opsSchema,
		});

		const migrationsFolder = path.resolve(process.cwd(), "ops/drizzle");
		await migrate(opsDb, { migrationsFolder });

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function main() {
	console.log("Starting ops database migration...\n");

	if (!process.env.DATABASE_URL) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	const result = await migrateOpsDatabase();

	if (result.success) {
		console.log("✓ Ops database migrated successfully!\n");
	} else {
		console.log(`✗ Migration failed: ${result.error || "Unknown error"}\n`);
		process.exit(1);
	}
}

main().catch((error) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	console.error("Fatal error:", errorMessage);
	process.exit(1);
});
