import { getUserNotifications } from "@/app/(dashboard)/[tenant]/settings/actions";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(_: NextRequest) {
	try {
		const notifications = await getUserNotifications();
		return NextResponse.json(notifications);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
