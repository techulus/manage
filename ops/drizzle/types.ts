import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as dbSchema from "./schema";

export type OpsDatabase = PostgresJsDatabase<typeof dbSchema>;
