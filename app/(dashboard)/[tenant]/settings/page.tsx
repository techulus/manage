import { logtoConfig } from "@/app/logto";
import { EditableValue } from "@/components/core/editable-text";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { blob } from "@/drizzle/schema";
import { bytesToMegabytes } from "@/lib/blobStore";
import type { UserCustomData } from "@/lib/ops/auth";
import { database } from "@/lib/utils/useDatabase";
import { getTimezone } from "@/lib/utils/useOwner";
import { getLogtoContext } from "@logto/next/server-actions";
import { sql } from "drizzle-orm";
import { HardDrive, User2 } from "lucide-react";
import { notFound } from "next/navigation";
import { updateUserData } from "./actions";

export default async function Settings() {
	const { claims, userInfo } = await getLogtoContext(logtoConfig, {
		fetchUserInfo: true,
	});

	if (!claims?.sub) {
		return notFound();
	}

	const db = await database();

	const [storage, timezone] = await Promise.all([
		db
			.select({
				count: sql<number>`count(*)`,
				usage: sql<number>`sum(${blob.contentSize})`,
			})
			.from(blob)
			.get(),
		getTimezone(),
	]);

	return (
		<>
			<PageTitle title="Settings" />

			<PageSection topInset bottomMargin>
				<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
					<HardDrive className="mr-2 inline-block h-6 w-6" />
					Storage
				</h2>

				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Usage
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							{bytesToMegabytes(storage?.usage ?? 0)} MB{" "}
							<p className="inline font-bold">/ 5 GB</p> ({storage?.count}{" "}
							files)
						</div>
					</dd>
				</div>
			</PageSection>

			{userInfo ? (
				<PageSection>
					<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
						<User2 className="mr-2 inline-block h-6 w-6" />
						Profile ({userInfo.username})
					</h2>

					<div className="p-4 flex items-center">
						<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Name
						</p>
						<EditableValue
							id={claims.sub}
							name="name"
							type="text"
							value={userInfo.name ?? "-"}
							action={updateUserData}
						/>
					</div>

					<div className="p-4 flex items-center">
						<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Email address
						</dt>
						<EditableValue
							id={claims.sub}
							name="primaryEmail"
							type="text"
							value={userInfo.email ?? "-"}
							action={updateUserData}
						/>
					</div>

					{timezone ? (
						<div className="p-4 sm:flex">
							<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
								Timezone
							</p>
							<div className="text-gray-900 dark:text-gray-200">{timezone}</div>
						</div>
					) : null}
				</PageSection>
			) : null}
		</>
	);
}
