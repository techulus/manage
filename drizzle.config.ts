import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "turso",
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
});
