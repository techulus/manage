"use client";

import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useProjectPrefetch(projectId: number) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!projectId) return;

		const prefetchData = async () => {
			const baseQueries = [
				queryClient.prefetchQuery(
					trpc.events.getByMonth.queryOptions({
						projectId,
						date: new Date(),
					}),
				),
				queryClient.prefetchQuery(
					trpc.projects.getProjectById.queryOptions({
						id: projectId,
					}),
				),
			];

			const taskListsQuery = queryClient.prefetchQuery(
				trpc.tasks.getTaskLists.queryOptions({
					projectId,
				}),
			);

			await Promise.allSettled([...baseQueries, taskListsQuery]);

			const taskListsData = queryClient.getQueryData(
				trpc.tasks.getTaskLists.queryKey({
					projectId,
				}),
			);

			if (taskListsData) {
				const individualTaskListQueries = taskListsData.map((taskList) =>
					queryClient.prefetchQuery(
						trpc.tasks.getListById.queryOptions({
							id: taskList.id,
						}),
					),
				);

				await Promise.allSettled(individualTaskListQueries);
			}
		};

		prefetchData();
	}, [projectId, queryClient, trpc]);
}

