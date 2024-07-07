import { createClient } from "@libsql/client/web";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function opsDb(): LibSQLDatabase<typeof schema> {
  const client = createClient({
    url: process.env.MANAGE_OPS_DATABASE!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  return drizzle(client, { schema });
}