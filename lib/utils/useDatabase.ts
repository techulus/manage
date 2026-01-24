import { drizzle } from "drizzle-orm/postgres-js";
import type { Database } from "@/drizzle/types";
import * as schema from "../../drizzle/schema";

let db: Database | null = null;

export function database(): Database {
	if (!db) {
		db = drizzle({
			connection: process.env.DATABASE_URL!,
			schema,
		});
	}
	return db;
}
