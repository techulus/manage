"use client";

import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useCallback, useContext } from "react";

// biome-ignore lint/suspicious/noExplicitAny: context value typed as any for flexibility
const TaskListsContext = createContext<any>(undefined);

export function TaskListsProvider({
	projectId,
	children,
}: {
	projectId: number;
	children: ReactNode;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const invalidateData = useCallback(
		(tasklistId: number) => {
			queryClient.invalidateQueries({
				queryKey: trpc.tasks.getListById.queryKey({ id: tasklistId }),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.tasks.getTaskLists.queryKey({
					projectId: +projectId!,
				}),
			});
		},
		[
			projectId,
			queryClient.invalidateQueries,
			trpc.tasks.getTaskLists.queryKey,
			trpc.tasks.getListById,
		],
	);

	const createTaskList = useMutation(
		trpc.tasks.createTaskList.mutationOptions({
			onSuccess: (data) => {
				invalidateData(data.id);
			},
			onError: displayMutationError,
		}),
	);

	const updateTaskList = useMutation(
		trpc.tasks.updateTaskList.mutationOptions({
			onSuccess: (data) => {
				invalidateData(data.id);
			},
			onError: displayMutationError,
		}),
	);

	const deleteTaskList = useMutation(
		trpc.tasks.deleteTaskList.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getTaskLists.queryKey({
						projectId: +projectId!,
					}),
				});
			},
			onError: displayMutationError,
		}),
	);

	const tidyUpTaskList = useMutation(
		trpc.tasks.tidyUpTaskList.mutationOptions({
			onSuccess: (data) => {
				invalidateData(data[0].taskListId);
			},
			onError: displayMutationError,
		}),
	);

	const value = {
		createTaskList,
		updateTaskList,
		deleteTaskList,
		tidyUpTaskList,
	};

	return (
		<TaskListsContext.Provider value={value}>
			{children}
		</TaskListsContext.Provider>
	);
}

export function useTaskLists() {
	const context = useContext(TaskListsContext);
	if (context === undefined) {
		throw new Error("useTaskLists must be used within a TaskListsProvider");
	}
	return context;
}
