"use client";

import { PageLoading } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import EditableDate from "@/components/form/editable-date";
import NotesForm from "@/components/form/notes-form";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { useTaskLists } from "@/hooks/use-tasklist";
import { TasksProvider } from "@/hooks/use-tasks";
import { toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useQueries } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function TaskLists() {
	const { projectId, tasklistId } = useParams();

	const trpc = useTRPC();
	const [{ data: list }, { data: timezone }] = useQueries({
		queries: [
			trpc.tasks.getListById.queryOptions({
				id: +tasklistId!,
			}),
			trpc.settings.getTimezone.queryOptions(),
		],
	});

	const { updateTaskList } = useTaskLists();

	const totalCount = list?.tasks.length;
	const doneCount = list?.tasks.filter((task) => task.status === "done").length;

	const completedPercent =
		totalCount && doneCount
			? Math.round((doneCount / totalCount) * 100)
			: undefined;

	if (!list || !timezone) return <PageLoading />;

	return (
		<>
			<PageTitle
				title={list.name}
				editableTitle
				titleOnChange={async (val) => {
					await updateTaskList.mutateAsync({
						id: list.id,
						name: val,
					});
				}}
			>
				<div className="flex flex-col pr-4 md:pr-0 space-y-1 space-x-0 md:flex-row md:space-y-0 md:space-x-3 text-gray-500 dark:text-gray-400">
					{totalCount != null && doneCount != null ? (
						<div className="inline-flex flex-row items-center space-x-2">
							<CheckCircle className="w-4 h-4" />
							<p className="block text-primary font-semibold">
								{doneCount} of {totalCount}
							</p>

							{completedPercent ? (
								<span className="text-sm">({completedPercent}%)</span>
							) : null}
						</div>
					) : null}

					<EditableDate
						value={list.dueDate}
						timezone={timezone}
						onChange={async (dueDate) => {
							await updateTaskList.mutateAsync({
								id: list.id,
								dueDate: dueDate ? toStartOfDay(dueDate).toISOString() : null,
							});
						}}
						label="due"
					/>
				</div>
			</PageTitle>

			<PageSection>
				<form
					className="flex flex-col px-4 py-2"
					action={async (formData) => {
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
					<TaskListItem key={list.id} id={list.id} hideHeader />
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
