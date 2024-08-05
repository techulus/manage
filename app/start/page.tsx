import {
	createDatabaseAndMigrate,
	isDatabaseCreatedForOwner,
} from "@/lib/utils/turso";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { addUserToTenantDb, reportLastActive } from "@/ops/user";
import { redirect } from "next/navigation";

export default async function Start() {
	const { ownerId, orgSlug } = await getOwner();

	const isDatabaseCreated = await isDatabaseCreatedForOwner(ownerId);
	if (isDatabaseCreated.error) {
		console.log("Database not created, creating...");
		await createDatabaseAndMigrate(ownerId);
	}

	const ready = await isDatabaseReady();

	if (!ready) {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		redirect("/start");
	}

	await reportLastActive();
	await addUserToTenantDb();
	redirect(`/${orgSlug}/projects`);
}
