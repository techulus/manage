import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { auth } from "@clerk/nextjs/server";
import { useQueryClient } from "@tanstack/react-query";
import { RedirectType, redirect } from "next/navigation";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function Start() {
	const { userId, orgSlug } = await auth();
	if (!userId) {
		console.warn("No session, redirecting to sign-in");
		redirect("/sign-in");
	}

	let ready = false;
	let retryCount = 0;
	const maxRetries = 10;

	while (!ready && retryCount < maxRetries) {
		ready = await isDatabaseReady();
		if (!ready) {
			console.log(
				`Database not ready, retrying (${retryCount + 1}/${maxRetries})...`,
			);
			await sleep(1500);
			retryCount++;
		}
	}

	if (!ready) {
		console.error("Database not ready after maximum retries");
		redirect("/error");
	}

	const queryClient = useQueryClient();
	queryClient.invalidateQueries();

	redirect(`/${orgSlug ?? "me"}/today`, RedirectType.replace);
}
