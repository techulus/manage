"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTRPC } from "@/trpc/client";

export function useOrganizationChange() {
	const queryClient = useQueryClient();
	const previousTenant = useRef<string | undefined>(undefined);
	const { tenant } = useParams();
	const trpc = useTRPC();

	useEffect(() => {
		const currentTenant = tenant as string;

		if (
			previousTenant.current !== undefined &&
			previousTenant.current !== currentTenant
		) {
			console.log(
				`Tenant changed from ${previousTenant.current} to ${currentTenant}. Invalidating all queries.`,
			);
			queryClient.invalidateQueries();
		}

		previousTenant.current = currentTenant;

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
	}, [tenant, queryClient, trpc]);
}
