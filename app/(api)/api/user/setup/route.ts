import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { addUserToTenantDb } from "@/lib/utils/useUser";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
	try {
		const ready = await isDatabaseReady();
		if (!ready) {
			return NextResponse.json({
				ready: false,
			});
		}

		await addUserToTenantDb();

		const { orgSlug } = await getOwner();
		return NextResponse.json({
			ready: true,
			redirect: `/${orgSlug}/today`,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
