import type { Config } from "drizzle-kit";

require("dotenv").config();

if (!process.env.MANAGE_OPS_DATABASE) {
	throw new Error("MANAGE_OPS_DATABASE is not set");
}

if (!process.env.DATABASE_AUTH_TOKEN) {
	throw new Error("DATABASE_AUTH_TOKEN is not set");
}

export default {
	schema: "./ops/schema.ts",
	out: "./ops",
	driver: "turso",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.MANAGE_OPS_DATABASE,
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
	verbose: true,
} satisfies Config;
