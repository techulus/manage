import { logtoConfig } from "@/app/logto";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { blob } from "@/drizzle/schema";
import { bytesToMegabytes } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getLogtoContext } from "@logto/next/server-actions";
import { sql } from "drizzle-orm";
import { HardDrive, User2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function Settings() {
	const { claims, userInfo } = await getLogtoContext(logtoConfig, {
		fetchUserInfo: true,
	});

	if (!claims?.sub) {
		return notFound();
	}

	const db = await database();

	const [storage] = [
		db
			.select({
				count: sql<number>`count(*)`,
				usage: sql<number>`sum(${blob.contentSize})`,
			})
			.from(blob)
			.get(),
	];

	return (
		<>
			<PageTitle title="Settings" />

			<PageSection topInset bottomMargin className="p-4">
				<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200">
					<HardDrive className="mr-2 inline-block h-6 w-6" />
					Storage
				</h2>

				<dl className="mt-6 space-y-6 divide-y divide-gray-100 text-sm leading-6 dark:divide-gray-800">
					<div className="pt-6 sm:flex">
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
				</dl>
			</PageSection>

			<PageSection className="p-4">
				<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200">
					<User2 className="mr-2 inline-block h-6 w-6" />
					Profile ({userInfo?.username})
				</h2>

				<dl className="mt-6 space-y-6 divide-y divide-gray-100  text-sm leading-6 dark:divide-gray-800">
					{userInfo?.email ? (
						<div className="pt-6 sm:flex">
							<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
								Email address
							</dt>
							<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
								<div className="text-gray-900 dark:text-gray-200">
									{userInfo.email}
								</div>
							</dd>
						</div>
					) : null}
				</dl>
			</PageSection>
		</>
	);
}
