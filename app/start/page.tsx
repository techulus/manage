import { headers } from "next/headers";
import { ClientRedirect } from "@/components/core/client-redirect";
import { auth } from "@/lib/auth";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export default async function Start() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const activeOrg = session?.session?.activeOrganizationId;

	return (
		<ClientRedirect
			path={session?.user ? `/${activeOrg ?? "me"}/today` : "/sign-in"}
		/>
	);
}
