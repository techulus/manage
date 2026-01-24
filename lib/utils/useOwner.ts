import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type Result = {
	userId: string;
	orgId: string | null;
	orgSlug: string;
	ownerId: string;
};

export async function getOwner(): Promise<Result> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		console.warn("No session, redirecting to sign-in");
		redirect("/sign-in");
	}

	const activeOrg = session.session.activeOrganizationId;

	return {
		userId: session.user.id,
		orgId: activeOrg ?? null,
		orgSlug: activeOrg ?? "me",
		ownerId: activeOrg ?? session.user.id,
	};
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}
