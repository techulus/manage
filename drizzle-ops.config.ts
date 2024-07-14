import type { Config } from "drizzle-kit";

require("dotenv").config();

export default {
  schema: "./ops/schema.ts",
  out: "./ops/migrations",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.MANAGE_OPS_DATABASE!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
  verbose: true,
} satisfies Config;
