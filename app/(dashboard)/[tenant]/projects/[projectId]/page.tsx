import EmptyState from "@/components/core/empty-state";
import { HtmlPreview } from "@/components/core/html-view";
import PageSection from "@/components/core/section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { DocumentFolderHeader } from "@/components/project/document/document-folder-header";
import { DocumentHeader } from "@/components/project/document/document-header";
import EventsCalendar from "@/components/project/events/events-calendar";
import WeekCalendar from "@/components/project/events/week-calendar";
import { TaskListHeader } from "@/components/project/tasklist/tasklist-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toDateStringWithDay } from "@/lib/utils/date";
import { caller } from "@/trpc/server";
import { CalendarPlusIcon, ListPlusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveProject, deleteProject, unarchiveProject } from "../actions";

type Props = {
	params: Promise<{
		tenant: string;
		projectId: string;
	}>;
};

export default async function ProjectDetails(props: Props) {
	const params = await props.params;
	const { projectId } = params;

	const [project, timezone] = await Promise.all([
		caller.projects.getProjectById({ id: +projectId, withTasksAndDocs: true }),
		caller.settings.getTimezone(),
	]);

	if (!project) {
		return notFound();
	}

	return (
		<>
			<PageTitle
				title={project.name}
				actionLabel="Edit"
				actionLink={`/${params.tenant}/projects/${projectId}/edit`}
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
									<form action={unarchiveProject}>
										<input
											className="hidden"
											name="id"
											defaultValue={project.id}
										/>
										<ActionButton label="Unarchive" variant="link" />
									</form>
									<form action={deleteProject}>
										<input
											className="hidden"
											name="id"
											defaultValue={project.id}
										/>
										<DeleteButton action="Delete" />
									</form>
								</>
							) : (
								<form action={archiveProject}>
									<input
										className="hidden"
										name="id"
										defaultValue={project.id}
									/>
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
						href={`/${params.tenant}/projects/${projectId}/tasklists/new`}
					>
						<ListPlusIcon className="mr-1 h-5 w-5" /> New
						<span className="sr-only">, task list</span>
					</Link>
				</div>

				{project.taskLists.length ? (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
						{project.taskLists.map((taskList) => {
							return (
								<div
									key={taskList.id}
									className="overflow-hidden rounded-lg border"
								>
									<TaskListHeader
										orgSlug={params.tenant}
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
					show={!project.taskLists.length}
					label="task list"
					createLink={`/${params.tenant}/projects/${projectId}/tasklists/new`}
				/>
			</div>

			<div className="mx-auto flex max-w-7xl flex-col mt-8 space-y-4 p-4 xl:p-0">
				<div className="flex justify-between flex-row items-center">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">
						Events this week
					</h2>

					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${params.tenant}/projects/${projectId}/events/new`}
					>
						<CalendarPlusIcon className="mr-1 h-5 w-5" /> New
						<span className="sr-only">, event</span>
					</Link>
				</div>

				<WeekCalendar timezone={timezone} compact />
			</div>

			<div className="mx-auto max-w-7xl p-4 lg:py-8">
				<CommentsSection
					type="project"
					parentId={project.id}
					projectId={projectId}
				/>
			</div>
		</>
	);
}
