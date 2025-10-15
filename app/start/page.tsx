import { auth } from "@clerk/nextjs/server";
import { ClientRedirect } from "@/components/core/client-redirect";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export default async function Start() {
	const { userId, orgSlug } = await auth();

	return (
		<ClientRedirect path={userId ? `/${orgSlug ?? "me"}/today` : "/sign-in"} />
	);
}
