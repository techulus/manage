import { createClient } from "@libsql/client/web";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import * as schema from "../../drizzle/schema";
import { getOwner } from "./useOwner";

const tursoOrganizationName = process.env.TURSO_ORGANIZATION_NAME;

function getDatabaseNameForOwner(ownerId: string) {
  return ownerId.replace(/_/g, "-").toLowerCase();
}

export async function isDatabaseReady(ownerId: string) {
  try {
    const db = getDatabaseForOwner(ownerId);
    await db.query.project.findFirst();
    return true;
  } catch (e) {
    return false;
  }
}

export async function createDatabaseAndMigrate(ownerId: string) {
  const name = getDatabaseNameForOwner(ownerId);
  const database = await fetch(
    `https://api.turso.tech/v1/organizations/${tursoOrganizationName}/databases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        group: process.env.TURSO_GROUP_ID,
      }),
    }
  ).then((res) => res.json());
  console.log("Created database", database, "for", name);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const databaseUrl = `libsql://${name}-${tursoOrganizationName}.turso.io`;

  const client = createClient({
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  });

  const db = drizzle(client, { schema });

  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  await migrate(db, { migrationsFolder: migrationsFolder });
  console.log("Migrated database for", name);

  return db;
}

export function getDatabaseForOwner(ownerId: string) {
  const databaseName = getDatabaseNameForOwner(ownerId);
  const databaseUrl = `libsql://${databaseName}-${tursoOrganizationName}.turso.io`;

  const client = createClient({
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  });

  return drizzle(client, { schema });
}

export async function deleteDatabaseForOwner(ownerId: string) {
  const databaseName = getDatabaseNameForOwner(ownerId);

  await fetch(
    `https://api.turso.tech/v1/organizations/${tursoOrganizationName}/databases/${databaseName}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
      },
    }
  );

  console.log("Deleted database for", databaseName);
}

export function database(): LibSQLDatabase<typeof schema> {
  const { ownerId } = getOwner();

  if (!ownerId) {
    throw new Error("Owner ID not found");
  }

  const databaseName = getDatabaseNameForOwner(ownerId);
  const databaseUrl = `libsql://${databaseName}-${tursoOrganizationName}.turso.io`;

  const client = createClient({
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  });

  return drizzle(client, { schema });
}
