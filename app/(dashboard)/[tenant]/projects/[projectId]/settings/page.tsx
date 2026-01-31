"use client";

import { useQuery } from "@tanstack/react-query";
import { Settings2, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import { PageLoading } from "@/components/core/loaders";
import PermissionsManagement from "@/components/core/permissions-management";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { useTRPC } from "@/trpc/client";

export default function ProjectSettings() {
	const params = useParams();
	const projectId = +params.projectId!;
	const tenant = params.tenant as string;
	const trpc = useTRPC();

	const { data: project, isLoading } = useQuery(
		trpc.projects.getProjectById.queryOptions({
			id: projectId,
		}),
	);

	const isOrgAdmin = tenant === "me";

	if (isLoading || !project) return <PageLoading />;

	return (
		<>
			<PageTitle title="Project settings" />

			<PageSection
				title="Project Settings"
				titleIcon={<Settings2 className="w-5 h-5" />}
				bottomMargin
			>
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Project Name
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							{project.name}
						</div>
					</dd>
				</div>

				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Status
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200 capitalize">
							{project.status}
						</div>
					</dd>
				</div>

				{project.dueDate && (
					<div className="p-4 sm:flex">
						<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Due Date
						</dt>
						<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
							<div className="text-gray-900 dark:text-gray-200">
								{new Date(project.dueDate).toLocaleDateString()}
							</div>
						</dd>
					</div>
				)}
			</PageSection>

			{isOrgAdmin && (
				<PageSection
					title="Permissions"
					titleIcon={<Shield className="w-5 h-5" />}
					bottomMargin
				>
					<PermissionsManagement projectId={projectId} />
				</PageSection>
			)}
		</>
	);
}
