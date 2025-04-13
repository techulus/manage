"use client";

import EmptyState from "@/components/core/empty-state";
import { HtmlPreview } from "@/components/core/html-view";
import { PageLoading } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import EditableDate from "@/components/form/editable-date";
import NotesForm from "@/components/form/notes-form";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import WeekCalendar from "@/components/project/events/week-calendar";
import { TaskListHeader } from "@/components/project/tasklist/tasklist-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { toDateStringWithDay, toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import { CalendarPlusIcon, ListPlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";

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

	const updateProject = useMutation(
		trpc.projects.updateProject.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.user.getProjects.queryKey({
						statuses: ["active"],
					}),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.projects.getProjectById.queryKey({
						id: projectId,
					}),
				});
			},
		}),
	);

	const deleteProject = useMutation(
		trpc.projects.deleteProject.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.user.getProjects.queryKey({
						statuses: ["active"],
					}),
				});
			},
		}),
	);

	return (
		<Suspense fallback={<PageLoading />}>
			<PageTitle
				title={project.name}
				editableTitle
				titleOnChange={async (val) => {
					await updateProject.mutateAsync({
						id: project.id,
						name: val,
					});
				}}
			>
				<div className="flex flex-col pr-4 md:pr-0 space-y-1 space-x-0 md:flex-row md:space-y-0 md:space-x-2 text-gray-500 dark:text-gray-400">
					{project.status === "archived" ? (
						<Badge variant="secondary">Archived</Badge>
					) : null}

					<EditableDate
						value={project.dueDate}
						timezone={timezone}
						onChange={async (date) => {
							await updateProject.mutateAsync({
								id: project.id,
								dueDate: date ? toStartOfDay(date) : null,
							});
						}}
						label="Due"
					/>
				</div>
			</PageTitle>

			<PageSection>
				<form
					className="flex flex-col px-4 py-2"
					action={async (formData) => {
						await updateProject.mutateAsync({
							id: project.id,
							description: formData.get("description") as string,
						});
					}}
				>
					<NotesForm value={project.description ?? ""} name="description" />
				</form>

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
											await updateProject.mutateAsync({
												id: project.id,
												status: "active",
											});
										}}
									>
										<ActionButton label="Unarchive" variant="link" />
									</form>
									<form
										action={async () => {
											await deleteProject.mutateAsync({
												id: project.id,
											});
											router.push(`/${tenant}/today`);
										}}
									>
										<DeleteButton action="Delete" />
									</form>
								</>
							) : (
								<form
									action={async () => {
										await updateProject.mutateAsync({
											id: project.id,
											status: "archived",
										});
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
						href={`/${tenant}/projects/${projectId}/tasklists?create=true`}
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
					createLink={`/${tenant}/projects/${projectId}/tasklists?create=true`}
				/>
			</div>

			<div className="mx-auto flex max-w-7xl flex-col mt-8 space-y-4 p-4 xl:p-0">
				<div className="flex justify-between flex-row items-center">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">
						Events this week
					</h2>

					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${tenant}/projects/${projectId}/events?create=true`}
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
