import { Building2, ChartBar, User2, Users } from "lucide-react";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { TeamSettings } from "@/components/settings/team-settings";
import { WorkspaceSettings } from "@/components/settings/workspace-settings";
import { bytesToMegabytes } from "@/lib/blobStore";
import { caller } from "@/trpc/server";

export default async function Settings() {
	const [storage, timezone, projectsData] = await Promise.all([
		caller.settings.getStorageUsage(),
		caller.settings.getTimezone(),
		caller.user.getProjects({ statuses: ["active", "archived"] }),
	]);

	const projects = projectsData.projects;

	return (
		<>
			<PageTitle title="Settings" />

			<PageSection
				title="Workspace"
				titleIcon={<Building2 className="w-5 h-5" />}
				bottomMargin
			>
				<WorkspaceSettings />
			</PageSection>

			<PageSection
				title="Team"
				titleIcon={<Users className="w-5 h-5" />}
				bottomMargin
			>
				<TeamSettings />
			</PageSection>

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

			<PageSection
				title="Profile"
				titleIcon={<User2 className="w-5 h-5" />}
				bottomMargin
			>
				<ProfileSettings />

				{timezone ? (
					<div className="p-4 sm:flex">
						<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Timezone
						</p>
						<div className="text-gray-900 dark:text-gray-200">{timezone}</div>
					</div>
				) : null}
			</PageSection>
		</>
	);
}
