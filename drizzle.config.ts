import type { Config } from "drizzle-kit";

require("dotenv").config();

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  },
} satisfies Config;
