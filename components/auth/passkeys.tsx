"use client";

import { authClient } from "@/lib/betterauth/auth-client";
import type { Passkey } from "better-auth/plugins/passkey";
import { Fingerprint } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PageSection from "../core/section";
import { Button } from "../ui/button";

export function ManagePasskeys() {
	const [passkeys, setPasskeys] = useState<Passkey[]>([]);

	const fetchPasskeys = useCallback(async () => {
		const { data, error } = await authClient.passkey.listUserPasskeys();
		if (error || !data) {
			console.error(error);
			return;
		}
		setPasskeys(data);
	}, []);

	useEffect(() => {
		fetchPasskeys();
	}, [fetchPasskeys]);

	return (
		<PageSection>
			<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
				<Fingerprint className="mr-2 inline-block h-6 w-6" />
				Passkeys
			</h2>

			{!passkeys.length ? (
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Setup your passkeys
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							<Button
								onClick={async () => {
									await authClient.passkey.addPasskey();
									await fetchPasskeys();
								}}
								className="max-w-[160px]"
							>
								Add a Passkey
							</Button>
						</div>
					</dd>
				</div>
			) : (
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Your passkeys
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							{passkeys.map((passkey) => (
								<div
									key={passkey.id}
									className="flex justify-between items-center"
								>
									<p className="pb-2">{passkey.id.substring(0, 7)}</p>
								</div>
							))}
						</div>
					</dd>
				</div>
			)}
		</PageSection>
	);
}
