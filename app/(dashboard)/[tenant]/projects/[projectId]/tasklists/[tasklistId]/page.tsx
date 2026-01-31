"use client";

import { useQueries } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { PageLoading } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import { ConfirmButton } from "@/components/form/button";
import EditableDate from "@/components/form/editable-date";
import NotesForm from "@/components/form/notes-form";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { TaskStatus } from "@/drizzle/types";
import { useTaskLists } from "@/hooks/use-tasklist";
import { TasksProvider } from "@/hooks/use-tasks";
import { toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";

export default function TaskLists() {
	const { projectId, tasklistId } = useParams();
	const [showDeleted, setShowDeleted] = useQueryState(
		"showDeleted",
		parseAsBoolean.withDefault(false),
	);

	const trpc = useTRPC();
	const [{ data: list }, { data: timezone }, { data: project }] = useQueries({
		queries: [
			trpc.tasks.getListById.queryOptions({
				id: +tasklistId!,
			}),
			trpc.settings.getTimezone.queryOptions(),
			trpc.projects.getProjectById.queryOptions({
				id: +projectId!,
			}),
		],
	});

	const { updateTaskList, tidyUpTaskList } = useTaskLists();

	const totalCount = list?.tasks.filter(
		(task) => task.status !== TaskStatus.DELETED,
	).length;
	const doneCount = list?.tasks.filter(
		(task) => task.status === TaskStatus.DONE,
	).length;

	const completedPercent =
		totalCount && doneCount
			? Math.round((doneCount / totalCount) * 100)
			: undefined;

	if (!list || !timezone || !project) return <PageLoading />;

	return (
		<>
			<PageTitle
				title={list.name}
				editableTitle={project.canEdit}
				titleOnChange={async (val) => {
					if (!project.canEdit) return;
					await updateTaskList.mutateAsync({
						id: list.id,
						name: val,
					});
				}}
			>
				<div className="flex flex-col pr-4 md:pr-0 space-y-1 space-x-0 md:flex-row md:space-y-0 md:space-x-3 text-gray-500 dark:text-gray-400">
					{totalCount != null && doneCount != null ? (
						<div className="inline-flex flex-row items-center space-x-2 text-sm">
							<p className="block text-primary font-semibold">
								{doneCount} of {totalCount}
							</p>

							{completedPercent ? <span>({completedPercent}%)</span> : null}
						</div>
					) : null}

					<div className="flex flex-row items-center space-x-2 pt-2 sm:pt-0">
						<EditableDate
							value={list.dueDate}
							timezone={timezone}
							onChange={async (dueDate) => {
								if (!project.canEdit) return;
								await updateTaskList.mutateAsync({
									id: list.id,
									dueDate: dueDate ? toStartOfDay(dueDate).toISOString() : null,
								});
							}}
							label="due"
						/>

						{doneCount && project.canEdit ? (
							<ConfirmButton
								variant="outline"
								size="sm"
								label="Tidy up"
								confirmLabel="Remove done tasks?"
								confirmVariant="destructive"
								className="inline-block max-w-[140px]"
								onClick={() => {
									tidyUpTaskList.mutate({
										id: list.id,
									});
								}}
							/>
						) : null}
					</div>
				</div>
			</PageTitle>

			<PageSection>
				<form
					className="flex flex-col px-4 py-2"
					action={async (formData) => {
						if (!project.canEdit) return;
						await updateTaskList.mutateAsync({
							id: list.id,
							description: formData.get("description") as string,
						});
					}}
				>
					<NotesForm value={list.description} name="description" />
				</form>
			</PageSection>

			<PageSection className="divide-y-0" transparent>
				<TasksProvider projectId={+projectId!} taskListId={+tasklistId!}>
					<TaskListItem
						key={list.id}
						id={list.id}
						hideHeader
						canEdit={project.canEdit}
						showDeleted={showDeleted}
						onShowDeletedChange={setShowDeleted}
					/>
				</TasksProvider>

				<div className="py-8">
					<CommentsSection
						roomId={`project/${projectId}/tasklist/${tasklistId}`}
					/>
				</div>
			</PageSection>
		</>
	);
}
