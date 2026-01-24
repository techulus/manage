import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { organization } from "@/drizzle/auth-schema";
import { auth } from "@/lib/auth";
import { database } from "@/lib/utils/useDatabase";

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

	const activeOrgId = session.session.activeOrganizationId;

	let orgSlug = "me";
	if (activeOrgId) {
		const db = database();
		const org = await db
			.select({ slug: organization.slug })
			.from(organization)
			.where(eq(organization.id, activeOrgId))
			.limit(1);
		if (org[0]) {
			orgSlug = org[0].slug;
		}
	}

	return {
		userId: session.user.id,
		orgId: activeOrgId ?? null,
		orgSlug,
		ownerId: activeOrgId ?? session.user.id,
	};
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}
