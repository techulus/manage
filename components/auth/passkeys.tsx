"use client";

import { Fingerprint } from "lucide-react";
import PageSection from "../core/section";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";

export async function ManagePasskeys() {
	const session = useSession();
	console.log(session);
	return (
		<PageSection>
			<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
				<Fingerprint className="mr-2 inline-block h-6 w-6" />
				Passkeys
			</h2>

			<Button
				onClick={async () => {
					const data = await authClient.passkey.addPasskey();
					console.log(data);
				}}
			>
				Add a Passkey
			</Button>
		</PageSection>
	);
}
