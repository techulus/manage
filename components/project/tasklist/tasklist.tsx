"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatus } from "@/drizzle/types";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import InlineTaskForm from "../../form/task";
import { TaskItem } from "./task/task-item";
import { TaskListHeader } from "./tasklist-header";

export const TaskListItem = ({
	id,
	hideHeader = false,
	compact = false,
	canEdit = true,
}: {
	id: number;
	hideHeader?: boolean;
	compact?: boolean;
	canEdit?: boolean;
}) => {
	const trpc = useTRPC();
	const { data: taskList, isLoading } = useQuery(
		trpc.tasks.getListById.queryOptions({
			id,
		}),
	);

	const { createTask, updateTask } = useTasks();

	const todoItems = useMemo(
		() =>
			taskList?.tasks.filter((task) => task.status === TaskStatus.TODO) ?? [],
		[taskList?.tasks],
	);

	const [localTodoItems, setLocalTodoItems] = useState(todoItems);
	useEffect(() => {
		setLocalTodoItems(todoItems);
	}, [todoItems]);

	const doneItems = useMemo(
		() =>
			taskList?.tasks.filter((task) => task.status === TaskStatus.DONE) ?? [],
		[taskList?.tasks],
	);

	const [showDeleted, setShowDeleted] = useState(false);
	const deletedItems = useMemo(
		() =>
			taskList?.tasks.filter((task) => task.status === TaskStatus.DELETED) ??
			[],
		[taskList?.tasks],
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

			updateTask.mutate({
				id: movedTask.id,
				position: newPosition,
			});

			setLocalTodoItems((items) =>
				arrayMove(items, movedTaskIndex, overTaskIndex),
			);
		},
		[localTodoItems, updateTask],
	);

	if (isLoading || !taskList) {
		return (
			<div className="max-h-96 w-full rounded-lg border p-4 bg-card">
				<Skeleton className="h-4 w-3/4 mb-4" />
				<Skeleton className="h-4 w-1/2 mb-2" />
				<div className="space-y-3 mt-6">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg bg-muted overflow-hidden">
			{!hideHeader ? (
				<TaskListHeader
					taskList={taskList}
					totalCount={
						taskList.tasks.filter((task) => task.status !== TaskStatus.DELETED)
							.length
					}
					doneCount={doneItems.length}
				/>
			) : null}

			<div
				className={cn(
					"flex flex-col justify-center",
					compact ? "max-h-96 overflow-y-auto" : "",
				)}
			>
				{canEdit ? (
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
									key={task.id}
									task={task}
									compact={compact}
									canEdit={canEdit}
								/>
							))}
						</SortableContext>
					</DndContext>
				) : (
					localTodoItems.map((task) => (
						<TaskItem
							key={task.id}
							task={task}
							compact={compact}
							canEdit={canEdit}
						/>
					))
				)}

				{!compact && canEdit ? (
					<div className="px-6 py-2">
						<InlineTaskForm
							action={async (name) => {
								createTask.mutate({
									name,
									taskListId: taskList.id,
								});
							}}
						/>
					</div>
				) : null}

				{compact
					? null
					: doneItems.map((task) => (
							<TaskItem key={task.id} task={task} canEdit={canEdit} />
						))}

				{compact ? null : (
					<>
						{showDeleted
							? deletedItems.map((task) => (
									<TaskItem key={task.id} task={task} canEdit={canEdit} />
								))
							: null}

						{deletedItems.length > 0 ? (
							<div className="px-6 py-2">
								<p className="text-sm text-muted-foreground">
									{deletedItems.length} deleted task(s)
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowDeleted((x) => !x)}
									>
										{showDeleted ? "Hide" : "Show"}
									</Button>
								</p>
							</div>
						) : null}
					</>
				)}
			</div>
		</div>
	);
};
