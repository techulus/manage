"use client";

import EmptyState from "@/components/core/empty-state";
import { HtmlPreview } from "@/components/core/html-view";
import { PageLoading } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import WeekCalendar from "@/components/project/events/week-calendar";
import { TaskListHeader } from "@/components/project/tasklist/tasklist-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { toDateStringWithDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import { CalendarPlusIcon, ListPlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";

export default function ProjectDetails() {
	const router = useRouter();
	const params = useParams();
	const projectId = +params.projectId!;
	const tenant = params.tenant as string;
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [{ data: timezone }, { data: project }, { data: taskLists }] =
		useSuspenseQueries({
			queries: [
				trpc.settings.getTimezone.queryOptions(),
				trpc.projects.getProjectById.queryOptions({
					id: projectId,
				}),
				trpc.tasks.getTaskLists.queryOptions({
					projectId: projectId,
				}),
			],
		});

	const revalidateProjectData = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: [
				trpc.user.getProjects,
				trpc.projects.getProjectById.queryKey({
					id: projectId,
				}),
			],
		});
	}, [
		queryClient,
		projectId,
		trpc.user.getProjects,
		trpc.projects.getProjectById,
	]);

	const updateProjectStatus = useMutation(
		trpc.projects.updateProjectStatus.mutationOptions(),
	);

	const deleteProject = useMutation(
		trpc.projects.deleteProject.mutationOptions(),
	);

	return (
		<Suspense fallback={<PageLoading />}>
			<PageTitle
				title={project.name}
				actionLabel="Edit"
				actionLink={`/${tenant}/projects/${projectId}/edit`}
			>
				{project.dueDate || project.status === "archived" ? (
					<div className="flex space-x-2">
						{project.dueDate ? (
							<Badge variant="outline">
								Due {toDateStringWithDay(project.dueDate, timezone)}
							</Badge>
						) : null}
						{project.status === "archived" ? (
							<Badge variant="outline" className="ml-2 text-red-500">
								Archived
							</Badge>
						) : null}
					</div>
				) : null}
			</PageTitle>

			<PageSection topInset>
				{project.description ? (
					<div className="flex flex-col px-4 py-2 lg:px-8">
						<HtmlPreview content={project.description ?? ""} />
					</div>
				) : null}

				<div className="flex h-12 flex-col justify-center">
					<div className="flex justify-between px-4 py-3">
						{/* Left buttons */}
						<div className="isolate inline-flex sm:space-x-3">
							<span className="inline-flex space-x-1" />
						</div>

						{/* Right buttons */}
						<span className="isolate inline-flex">
							{project.status === "archived" ? (
								<>
									<form
										action={async () => {
											await updateProjectStatus.mutateAsync({
												id: project.id,
												status: "active",
											});
											await revalidateProjectData();
										}}
									>
										<ActionButton label="Unarchive" variant="link" />
									</form>
									<form
										action={async () => {
											await deleteProject.mutateAsync({
												id: project.id,
											});
											await revalidateProjectData();
											router.push(`/${tenant}/projects`);
										}}
									>
										<DeleteButton action="Delete" />
									</form>
								</>
							) : (
								<form
									action={async () => {
										await updateProjectStatus.mutateAsync({
											id: project.id,
											status: "archived",
										});
										await revalidateProjectData();
									}}
								>
									<DeleteButton action="Archive" />
								</form>
							)}
						</span>
					</div>
				</div>
			</PageSection>

			<div className="mx-auto flex max-w-7xl flex-col p-4 xl:p-0 lg:pb-12">
				<div className="flex justify-between flex-row items-center my-4">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">Tasks</h2>

					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${tenant}/projects/${projectId}/tasklists/new`}
					>
						<ListPlusIcon className="mr-1 h-5 w-5" /> New
						<span className="sr-only">, task list</span>
					</Link>
				</div>

				{taskLists.length ? (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
						{taskLists.map((taskList) => {
							return (
								<div
									key={taskList.id}
									className="overflow-hidden rounded-lg border"
								>
									<TaskListHeader
										orgSlug={tenant}
										taskList={taskList}
										totalCount={taskList.tasks.length}
										doneCount={
											taskList.tasks.filter((task) => task.status === "done")
												.length
										}
									/>
								</div>
							);
						})}
					</ul>
				) : null}

				<EmptyState
					show={!taskLists.length}
					label="task list"
					createLink={`/${tenant}/projects/${projectId}/tasklists/new`}
				/>
			</div>

			<div className="mx-auto flex max-w-7xl flex-col mt-8 space-y-4 p-4 xl:p-0">
				<div className="flex justify-between flex-row items-center">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">
						Events this week
					</h2>

					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${tenant}/projects/${projectId}/events/new`}
					>
						<CalendarPlusIcon className="mr-1 h-5 w-5" /> New
						<span className="sr-only">, event</span>
					</Link>
				</div>

				<WeekCalendar timezone={timezone} compact />
			</div>

			<div className="mx-auto max-w-7xl p-4 lg:py-8">
				<CommentsSection roomId={`project/${project.id}`} />
			</div>
		</Suspense>
	);
}
