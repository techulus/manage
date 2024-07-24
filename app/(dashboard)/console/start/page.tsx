import {
  createDatabaseAndMigrate,
  isDatabaseCreatedForOwner,
} from "@/lib/utils/turso";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { addUserToTenantDb, reportLastActive } from "@/ops/user";
import { redirect } from "next/navigation";

export default async function Start() {
  const { ownerId, type } = await getOwner();

  const isDatabaseCreated = await isDatabaseCreatedForOwner(ownerId, type);
  if (isDatabaseCreated.error) {
    console.log("Database not created, creating...");
    await createDatabaseAndMigrate(ownerId, type);
  }

  const ready = await isDatabaseReady();

  if (!ready) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    redirect("/console/start");
  }

  await reportLastActive();
  await addUserToTenantDb();
  redirect("/console/projects");
}
