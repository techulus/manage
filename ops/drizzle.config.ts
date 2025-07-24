import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
	dialect: "postgresql",
	schema: "./ops/drizzle/schema.ts",
	out: "./ops/drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});