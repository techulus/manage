import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { addUserToTenantDb } from "@/lib/utils/useUser";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({
				ready: false,
				redirect: "/sign-in",
			});
		}

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
