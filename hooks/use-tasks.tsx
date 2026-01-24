"use client";

import {
	type TaskListWithTasks,
	TaskStatus,
	type TaskWithDetails,
} from "@/drizzle/types";
import { useSession } from "@/lib/auth/client";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useCallback, useContext } from "react";

// biome-ignore lint/suspicious/noExplicitAny: context value typed as any for flexibility
const TasksContext = createContext<any>(undefined);

export function TasksProvider({
	projectId,
	taskListId,
	children,
}: {
	projectId: number;
	taskListId: number;
	children: ReactNode;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	const invalidateData = useCallback(
		(listId = -1) => {
			queryClient.invalidateQueries({
				queryKey: trpc.tasks.getListById.queryKey({ id: taskListId }),
			});
			if (listId && listId !== taskListId) {
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: listId }),
				});
			}
			queryClient.invalidateQueries({
				queryKey: trpc.tasks.getTaskLists.queryKey({
					projectId: +projectId!,
				}),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.user.getTodayData.queryKey(),
			});
		},
		[
			projectId,
			taskListId,
			queryClient.invalidateQueries,
			trpc.tasks.getListById.queryKey,
			trpc.tasks.getTaskLists.queryKey,
			trpc.user.getTodayData.queryKey,
		],
	);

	const createTask = useMutation(
		trpc.tasks.createTask.mutationOptions({
			onSuccess: (data) => invalidateData(data?.taskListId),
			onMutate: async (newTask) => {
				await queryClient.cancelQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
				});

				const previousTasks = queryClient.getQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
				);

				queryClient.setQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
					(tasklist) => {
						if (!tasklist) return tasklist;

						const createdTask: TaskWithDetails = {
							id: Number.MAX_SAFE_INTEGER - Date.now(),
							taskListId: newTask.taskListId || 0,
							name: newTask.name || "",
							description: null,
							status: newTask.status || TaskStatus.TODO,
							dueDate: null,
							createdAt: new Date(),
							updatedAt: new Date(),
							createdByUser: "",
							position: 0,
							assignedToUser: null,
							creator: {
								firstName: session?.user?.name || null,
								image: session?.user?.image || null,
							},
							assignee: null,
						};

						return {
							...tasklist,
							tasks: [...(tasklist.tasks || []), createdTask],
						};
					},
				);

				return { previousTasks };
			},
			onError: (error, newTask, context) => {
				displayMutationError(error);
				if (context?.previousTasks) {
					queryClient.setQueryData<TaskListWithTasks>(
						trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
						context.previousTasks,
					);
				}
			},
		}),
	);
	const updateTask = useMutation(
		trpc.tasks.updateTask.mutationOptions({
			onSuccess: (task) => invalidateData(task.taskListId),
			onMutate: async (updatedTask) => {
				if ("position" in updatedTask) return;

				await queryClient.cancelQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: taskListId }),
				});

				const previousTasks = queryClient.getQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: taskListId }),
				);

				queryClient.setQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: taskListId }),
					(tasklist) => {
						if (!tasklist) return tasklist;

						const updatedTaskWithDate = {
							...updatedTask,
							dueDate:
								"dueDate" in updatedTask && updatedTask.dueDate
									? new Date(updatedTask.dueDate)
									: null,
							updatedAt: new Date(),
						};

						return {
							...tasklist,
							tasks: tasklist.tasks.map((t) =>
								t.id === updatedTask.id
									? ({
											...t,
											...updatedTaskWithDate,
										} as unknown as TaskWithDetails)
									: t,
							),
						};
					},
				);

				return { previousTasks };
			},
			onError: (error, _, context) => {
				displayMutationError(error);
				if (context?.previousTasks) {
					queryClient.setQueryData<TaskListWithTasks>(
						trpc.tasks.getListById.queryKey({ id: taskListId }),
						context.previousTasks,
					);
				}
			},
		}),
	);

	const deleteTask = useMutation(
		trpc.tasks.deleteTask.mutationOptions({
			onSuccess: () => invalidateData(),
			onMutate: async (deletedTask) => {
				await queryClient.cancelQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: taskListId }),
				});

				const previousTasks = queryClient.getQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: taskListId }),
				);

				queryClient.setQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: taskListId }),
					(tasklist) => {
						if (!tasklist) return tasklist;
						return {
							...tasklist,
							tasks: tasklist.tasks.filter((t) => t.id !== deletedTask.id),
						};
					},
				);

				return { previousTasks };
			},
			onError: (error, _, context) => {
				displayMutationError(error);
				if (context?.previousTasks) {
					queryClient.setQueryData<TaskListWithTasks>(
						trpc.tasks.getListById.queryKey({ id: taskListId }),
						context.previousTasks,
					);
				}
			},
		}),
	);

	const value = {
		createTask,
		updateTask,
		deleteTask,
	};

	return (
		<TasksContext.Provider value={value}>{children}</TasksContext.Provider>
	);
}

export function useTasks() {
	const context = useContext(TasksContext);
	if (context === undefined) {
		throw new Error("useTasks must be used within a TasksProvider");
	}
	return context;
}
