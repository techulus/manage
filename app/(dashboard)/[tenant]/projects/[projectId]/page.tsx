import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import PageSection from "@/components/core/section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { DocumentFolderHeader } from "@/components/project/document/document-folder-header";
import { DocumentHeader } from "@/components/project/document/document-header";
import EventsCalendar from "@/components/project/events/events-calendar";
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
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { getProjectById } from "@/lib/utils/useProjects";
import { CalendarPlusIcon, ListPlusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveProject, deleteProject, unarchiveProject } from "../actions";

type Props = {
	params: Promise<{
		projectId: string;
	}>;
};

export default async function ProjectDetails(props: Props) {
	const params = await props.params;
	const { projectId } = params;

	const project = await getProjectById(projectId, true);
	const { userId, orgSlug } = await getOwner();
	const timezone = await getTimezone();

	if (!project) {
		return notFound();
	}

	return (
		<>
			<PageTitle
				title={project.name}
				actionLabel="Edit"
				actionLink={`/${orgSlug}/projects/${projectId}/edit`}
				actionType="edit"
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
						<MarkdownView content={project.description ?? ""} />
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

			<div className="mx-auto flex max-w-5xl flex-col p-4 xl:p-0 lg:pb-12">
				<div className="flex justify-between flex-row items-center my-4">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">
						Task Lists
					</h2>

					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${orgSlug}/projects/${projectId}/tasklists/new`}
						prefetch={false}
					>
						<ListPlusIcon className="mr-1 h-5 w-5" /> New
						<span className="sr-only">, task list</span>
					</Link>
				</div>

				{project.taskLists.length ? (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2 mt-4">
						{project.taskLists.map((taskList) => {
							return (
								<div
									key={taskList.id}
									className="overflow-hidden rounded-lg border"
								>
									<TaskListHeader
										orgSlug={orgSlug}
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
					createLink={`/${orgSlug}/projects/${projectId}/tasklists/new`}
				/>
			</div>

			<div className="mx-auto flex max-w-5xl flex-col space-y-4 mt-8 p-4 xl:p-0 lg:pb-12">
				<div className="flex justify-between flex-row items-center">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">
						Docs &amp; Files
					</h2>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm">
								<PlusIcon className="mr-1 h-5 w-5" />
								New
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>
								<Link
									className="w-full"
									href={`/${orgSlug}/projects/${projectId}/documents/new`}
									prefetch={false}
								>
									Document
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link
									className="w-full"
									href={`/${orgSlug}/projects/${projectId}/documents/folders/new`}
									prefetch={false}
								>
									Folder
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{project.documents.length || project.documentFolders.length ? (
					<ul className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-6">
						{project.documents.map((document) => (
							<div key={document.id}>
								<DocumentHeader document={document} />
							</div>
						))}
						{project.documentFolders.map((folder) => (
							<div key={folder.id}>
								<DocumentFolderHeader documentFolder={folder} />
							</div>
						))}
					</ul>
				) : null}

				<EmptyState
					show={!project.documents.length && !project.documentFolders.length}
					label="document"
					createLink={`/${orgSlug}/projects/${projectId}/documents/new`}
				/>
			</div>

			<div className="mx-auto flex max-w-5xl flex-col mt-8 space-y-4 p-4 xl:p-0">
				<div className="flex justify-between flex-row items-center">
					<h2 className="text-2xl font-bold leading-7 tracking-tight">
						Events
					</h2>

					<Link
						className={buttonVariants({ size: "sm" })}
						href={`/${orgSlug}/projects/${projectId}/events/new`}
						prefetch={false}
					>
						<CalendarPlusIcon className="mr-1 h-5 w-5" /> New
						<span className="sr-only">, event</span>
					</Link>
				</div>

				<div className="flex w-full rounded-lg border bg-card">
					<EventsCalendar
						projectId={projectId}
						userId={userId}
						events={project.events}
						orgSlug={orgSlug}
						timezone={timezone}
						compact
					/>
				</div>
			</div>

			<div className="mx-auto max-w-5xl p-4 lg:py-8">
				<CommentsSection
					type="project"
					parentId={project.id}
					projectId={projectId}
				/>
			</div>
		</>
	);
}
