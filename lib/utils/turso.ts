import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import * as schema from "../../drizzle/schema";
import { OwnerType } from "./useOwner";

export const tursoOrganizationName = process.env.TURSO_ORGANIZATION_NAME;

export function getDatabaseNameForOwner(ownerId: string, type: OwnerType) {
  return `${type}-${ownerId
    .replace(/-/g, "")
    .replace(/_/g, "-")
    .toLowerCase()}`;
}

export async function createDatabaseAndMigrate(
  ownerId: string,
  type: OwnerType
) {
  const name = getDatabaseNameForOwner(ownerId, type);
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

export async function deleteDatabaseForOwner(ownerId: string, type: OwnerType) {
  const databaseName = getDatabaseNameForOwner(ownerId, type);

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

export async function isDatabaseCreatedForOwner(
  ownerId: string,
  type: OwnerType
) {
  const databaseName = getDatabaseNameForOwner(ownerId, type);

  const database = await fetch(
    `https://api.turso.tech/v1/organizations/${tursoOrganizationName}/databases/${databaseName}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
      },
    }
  ).then((res) => res.json());

  return database;
}
