import { createClient } from "@libsql/client/web";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

if (!process.env.MANAGE_OPS_DATABASE) {
	throw new Error("MANAGE_OPS_DATABASE is not set");
}

if (!process.env.DATABASE_AUTH_TOKEN) {
	throw new Error("DATABASE_AUTH_TOKEN is not set");
}

export function opsDb(): LibSQLDatabase<typeof schema> {
	const client = createClient({
		url: String(process.env.MANAGE_OPS_DATABASE),
		authToken: process.env.DATABASE_AUTH_TOKEN,
	});

	return drizzle(client, { schema });
}
