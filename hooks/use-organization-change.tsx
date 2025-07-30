"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTRPC } from "@/trpc/client";

export function useOrganizationChange() {
	const { organization } = useOrganization();
	const queryClient = useQueryClient();
	const previousOrgId = useRef<string | undefined>(null);
	const { tenant } = useParams();
	const trpc = useTRPC();

	useEffect(() => {
		const currentOrgId = organization?.id;

		if (
			previousOrgId.current !== undefined &&
			previousOrgId.current !== currentOrgId
		) {
			console.log(
				`Organization changed from ${previousOrgId.current} to ${currentOrgId}. Invalidating all queries.`,
			);
			// Clear all cached queries
			queryClient.clear();
		}

		previousOrgId.current = currentOrgId;

		Promise.all([
			queryClient.prefetchQuery(trpc.settings.getTimezone.queryOptions()),
			queryClient.prefetchQuery(trpc.user.getTodayData.queryOptions()),
			queryClient.prefetchQuery(trpc.user.getNotificationsWire.queryOptions()),
			queryClient.prefetchQuery(
				trpc.user.getProjects.queryOptions({
					statuses: ["active"],
				}),
			),
		])
			.then(() => {
				console.log(">>>>> Prefetched essential queries for tenant", tenant);
			})
			.catch((err) => {
				console.error(">>>>> Error prefetching essential queries", err);
			});
	}, [
		organization?.id,
		queryClient,
		trpc.user.getProjects.queryOptions,
		trpc.settings.getTimezone.queryOptions,
		trpc.user.getTodayData.queryOptions,
		trpc.user.getNotificationsWire.queryOptions,
		tenant,
	]);
}
