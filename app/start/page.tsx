import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { addUserToTenantDb } from "@/lib/utils/useUser";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Start() {
	const { orgSlug } = await getOwner();

	const ready = await isDatabaseReady();

	if (!ready) {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		redirect("/start");
	}

	await addUserToTenantDb();
	redirect(`/${orgSlug}/today`);
}
