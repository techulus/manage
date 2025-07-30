import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as dbSchema from "./schema";

export type OpsDatabase = NodePgDatabase<typeof dbSchema>;
