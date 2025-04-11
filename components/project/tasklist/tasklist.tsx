"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
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
import {
	useMutation,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { HtmlPreview } from "../../core/html-view";
import InlineTaskForm from "../../form/task";
import { TaskItem } from "./task/task-item";
import { TaskListHeader } from "./tasklist-header";

export const TaskListItem = ({
	id,
	hideHeader = false,
	compact = false,
}: {
	id: number;
	hideHeader?: boolean;
	compact?: boolean;
}) => {
	const trpc = useTRPC();
	const [{ data: taskList }] = useSuspenseQueries({
		queries: [
			trpc.tasks.getListById.queryOptions({
				id,
			}),
		],
	});

	const queryClient = useQueryClient();
	const createTask = useMutation(
		trpc.tasks.createTask.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id }),
				});
			},
		}),
	);
	const updateTask = useMutation(
		trpc.tasks.updateTask.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getListById.queryKey({
						id,
					}),
				});
			},
		}),
	);

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

			updateTask.mutateAsync({
				id: movedTask.id,
				position: newPosition,
			});

			setLocalTodoItems((items) =>
				arrayMove(items, movedTaskIndex, overTaskIndex),
			);
		},
		[localTodoItems, updateTask],
	);

	return (
		<Suspense
			fallback={
				<div className="max-h-96 w-full rounded-lg border p-4 bg-card">
					<Skeleton className="h-4 w-3/4 mb-4" />
					<Skeleton className="h-4 w-1/2 mb-2" />
					<div className="space-y-3 mt-6">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
					</div>
				</div>
			}
		>
			<div className="rounded-lg border bg-card">
				{!hideHeader ? (
					<TaskListHeader
						taskList={taskList}
						totalCount={taskList.tasks.length}
						doneCount={doneItems.length}
					/>
				) : null}

				{taskList.description ? (
					<div className="border-b px-4 py-2">
						<HtmlPreview content={taskList.description ?? ""} />
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
								<TaskItem key={task.id} task={task} compact={compact} />
							))}
						</SortableContext>
					</DndContext>

					{!compact ? (
						<form
							className="px-6 py-2"
							action={async (formData: FormData) => {
								const name = formData.get("name") as string;
								await createTask.mutateAsync({
									name,
									taskListId: taskList.id,
								});
							}}
						>
							<InlineTaskForm />
						</form>
					) : null}

					{compact
						? null
						: doneItems.map((task) => <TaskItem key={task.id} task={task} />)}
				</div>
			</div>
		</Suspense>
	);
};
