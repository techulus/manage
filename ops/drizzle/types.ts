import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type * as dbSchema from "./schema";

export type OpsDatabase = NeonHttpDatabase<typeof dbSchema>;
