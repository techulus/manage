import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { blob } from "@/drizzle/schema";
import { bytesToMegabytes } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getTimezone, getUser } from "@/lib/utils/useOwner";
import { sql } from "drizzle-orm";
import { HardDrive, User2 } from "lucide-react";

export default async function Settings() {
	const db = await database();

	const [user, storage, timezone] = await Promise.all([
		getUser(),
		db
			.select({
				count: sql<number>`count(*)`,
				usage: sql<number>`sum(${blob.contentSize})`,
			})
			.from(blob)
			.execute(),
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
							{bytesToMegabytes(storage?.[0].usage ?? 0)} MB{" "}
							<p className="inline font-bold">/ 5 GB</p> ({storage?.[0].count}{" "}
							files)
						</div>
					</dd>
				</div>
			</PageSection>

			{user ? (
				<PageSection>
					<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
						<User2 className="mr-2 inline-block h-6 w-6" />
						Profile ({user.email})
					</h2>

					<div className="p-4 sm:flex items-center">
						<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Name
						</p>
						<p>
							{user.firstName} {user.lastName}
						</p>
					</div>

					<div className="p-4 sm:flex items-center">
						<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Email address
						</p>
						<p>{user.email}</p>
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
