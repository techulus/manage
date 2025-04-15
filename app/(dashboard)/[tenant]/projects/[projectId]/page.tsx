"use client";

import EmptyState from "@/components/core/empty-state";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import { CalendarIcon, ListIcon, MenuSquare } from "lucide-react";
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
						<Badge variant="outline">Archived</Badge>
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
								<ActionButton
									label="Unarchive"
									variant="ghost"
									className="h-8"
								/>
							</form>
							<form
								action={async () => {
									await deleteProject.mutateAsync({
										id: project.id,
									});
									router.push(`/${tenant}/today`);
								}}
							>
								<DeleteButton action="Delete" className="h-8" compact />
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
							<DeleteButton action="Archive" className="h-8" compact />
						</form>
					)}
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
			</PageSection>

			<PageSection
				title="Tasks"
				titleIcon={<ListIcon className="w-5 h-5" />}
				titleAction={
					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${tenant}/projects/${projectId}/tasklists?create=true`}
					>
						New
						<span className="sr-only">, task list</span>
					</Link>
				}
				transparent
			>
				{taskLists.length ? (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
						{taskLists.map((taskList) => {
							return (
								<div key={taskList.id} className="overflow-hidden rounded-lg ">
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
			</PageSection>

			<PageSection
				title="Events this week"
				titleIcon={<CalendarIcon className="w-5 h-5" />}
				titleAction={
					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${tenant}/projects/${projectId}/events?create=true`}
					>
						New
						<span className="sr-only">, event</span>
					</Link>
				}
				className="p-2"
			>
				<WeekCalendar timezone={timezone} compact />
			</PageSection>

			<div className="mx-auto max-w-7xl p-4 lg:py-8">
				<CommentsSection roomId={`project/${project.id}`} />
			</div>
		</Suspense>
	);
}
