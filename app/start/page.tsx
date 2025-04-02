import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { addUserToTenantDb } from "@/lib/utils/useUser";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function Start() {
	await sleep(500); // hack to prevent redirect loop

	const { orgSlug } = await getOwner();

	const ready = await isDatabaseReady();
	if (!ready) {
		await sleep(2000);
		redirect("/start");
	}

	await addUserToTenantDb();
	redirect(`/${orgSlug}/today`);
}
