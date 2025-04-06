import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Result = {
	ownerId: string;
	userId: string;
	orgId: string | null;
	orgSlug: string;
};

export async function getOwner(): Promise<Result> {
	const { userId, orgId, orgSlug } = await auth();
	if (!userId) {
		console.warn("No session, redirecting to sign-in");
		redirect("/sign-in");
	}

	return {
		ownerId: orgId ?? userId,
		userId,
		orgId,
		orgSlug: orgSlug ?? "me",
	} as Result;
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}
