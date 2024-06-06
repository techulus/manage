import type { Config } from "drizzle-kit";

require("dotenv").config();

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  },
  verbose: true,
  strict: true,
} satisfies Config;
