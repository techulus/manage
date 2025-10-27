"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo, useEffect } from "react";
import { useTRPC } from "@/trpc/client";

export const ReportTimezone = memo(function ReportTimezone() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const saveTimezone = useMutation(
		trpc.settings.saveTimezone.mutationOptions(),
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: no explanation
	useEffect(() => {
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		if (timeZone) {
			saveTimezone.mutate(timeZone, {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: trpc.settings.getTimezone.queryKey(),
					});
				},
			});
		}
	}, []);

	return null;
});
