"use client";

import { repositionTask } from "@/app/(dashboard)/[tenant]/projects/[projectId]/tasklists/actions";
import type { TaskList, TaskListWithTasks, User } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import {
	DndContext,
	type DragEndEvent,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MarkdownView } from "../../core/markdown-view";
import InlineTaskForm from "../../form/task";
import { TaskItem } from "./task/task-item";
import { TaskListHeader } from "./tasklist-header";

export const TaskListItem = ({
	taskList,
	userId,
	projectId,
	orgSlug,
	createTask,
	partialUpdateTaskList,
	timezone,
	taskListsPromise,
	usersPromise,
	hideHeader = false,
	compact = false,
}: {
	taskList: TaskListWithTasks;
	userId: string;
	projectId: number;
	orgSlug: string;
	timezone: string;
	taskListsPromise: Promise<TaskList[]>;
	usersPromise: Promise<User[]>;
	createTask: (data: {
		name: string;
		userId: string;
		taskListId: number;
		projectId: number;
	}) => Promise<void>;
	partialUpdateTaskList: (
		id: number,
		data: { status: string },
	) => Promise<void>;
	hideHeader?: boolean;
	compact?: boolean;
}) => {
	const todoItems = useMemo(
		() => taskList.tasks.filter((task) => task.status === "todo"),
		[taskList.tasks],
	);

	const [localTodoItems, setLocalTodoItems] = useState(todoItems);
	useEffect(() => {
		setLocalTodoItems(todoItems);
	}, [todoItems]);

	const doneItems = useMemo(
		() => taskList.tasks.filter((task) => task.status === "done"),
		[taskList.tasks],
	);

	const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

	const handleDragEnd = useCallback(
		({ active, over }: DragEndEvent) => {
			if (active.id === over?.id) return;

			const movedTaskIndex = localTodoItems.findIndex(
				(x) => x.id === active.id,
			);
			const movedTask = localTodoItems[movedTaskIndex];

			const overTaskIndex = localTodoItems.findIndex((x) => x.id === over?.id);

			const newPosition =
				overTaskIndex === 0
					? localTodoItems?.[0].position / 2
					: overTaskIndex === localTodoItems.length - 1
						? localTodoItems[localTodoItems.length - 1].position + 1000
						: (localTodoItems[overTaskIndex - 1].position +
								localTodoItems[overTaskIndex].position) /
							2;

			repositionTask(movedTask.id, projectId, newPosition);

			setLocalTodoItems((items) =>
				arrayMove(items, movedTaskIndex, overTaskIndex),
			);
		},
		[localTodoItems, projectId],
	);

	return (
		<div className="rounded-lg border bg-card">
			{!hideHeader ? (
				<TaskListHeader
					taskList={taskList}
					totalCount={taskList.tasks.length}
					doneCount={doneItems.length}
					orgSlug={orgSlug}
					partialUpdateTaskList={partialUpdateTaskList}
				/>
			) : null}

			{taskList.description ? (
				<div className="border-b px-4 py-2">
					<MarkdownView content={taskList.description ?? ""} />
				</div>
			) : null}

			<div
				className={cn(
					"flex flex-col justify-center",
					compact ? "max-h-96 overflow-y-auto" : "",
				)}
			>
				<DndContext
					id="tasklist-dnd"
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={localTodoItems}
						strategy={verticalListSortingStrategy}
					>
						{localTodoItems.map((task) => (
							<TaskItem
								timezone={timezone}
								key={task.id}
								task={task}
								projectId={+projectId}
								taskListsPromise={taskListsPromise}
								usersPromise={usersPromise}
								compact={compact}
							/>
						))}
					</SortableContext>
				</DndContext>

				{!compact ? (
					<form
						className="px-6 py-2"
						action={async (formData: FormData) => {
							const name = formData.get("name") as string;
							await createTask({
								name,
								userId,
								taskListId: taskList.id,
								projectId,
							});
						}}
					>
						<InlineTaskForm />
					</form>
				) : null}

				{compact
					? null
					: doneItems.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								projectId={+projectId}
								timezone={timezone}
								usersPromise={usersPromise}
							/>
						))}
			</div>
		</div>
	);
};
