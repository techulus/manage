import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { bytesToMegabytes } from "@/lib/blobStore";
import { caller } from "@/trpc/server";
import { ChartBar, User2 } from "lucide-react";

export default async function Settings() {
	const [user, storage, timezone, projects] = await Promise.all([
		caller.user.getCurrentUser(),
		caller.settings.getStorageUsage(),
		caller.settings.getTimezone(),
		caller.user.getProjects({ statuses: ["active", "archived"] }),
	]);

	return (
		<>
			<PageTitle title="Settings" />

			{/* <PageSection
				title="Billing"
				titleIcon={<CreditCard className="w-5 h-5" />}
				bottomMargin
				transparent
			>
				<Billing />
			</PageSection> */}

			<PageSection
				title="Usage"
				titleIcon={<ChartBar className="w-5 h-5" />}
				bottomMargin
			>
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Projects
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							{projects.length}{" "}
							<p className="inline">
								/ <span className="line-through">1</span> (unlimited during
								beta)
							</p>
						</div>
					</dd>
				</div>
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Storage
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							{bytesToMegabytes(storage?.usage ?? 0)} MB{" "}
							<p className="inline font-bold">/ 50 MB</p> ({storage?.count}{" "}
							files)
						</div>
					</dd>
				</div>
			</PageSection>

			{user ? (
				<PageSection
					title="Profile"
					titleIcon={<User2 className="w-5 h-5" />}
					bottomMargin
				>
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
