import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { ClientRedirect } from "@/components/core/client-redirect";
import { organization } from "@/drizzle/auth-schema";
import { auth } from "@/lib/auth";
import { database } from "@/lib/utils/useDatabase";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export default async function Start() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return <ClientRedirect path="/sign-in" />;
	}

	const activeOrgId = session.session.activeOrganizationId;

	let slug = "me";
	if (activeOrgId) {
		const db = database();
		const org = await db
			.select({ slug: organization.slug })
			.from(organization)
			.where(eq(organization.id, activeOrgId))
			.limit(1);
		if (org[0]) {
			slug = org[0].slug;
		}
	}

	return <ClientRedirect path={`/${slug}/today`} />;
}
