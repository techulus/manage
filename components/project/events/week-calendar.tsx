"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventWithCreator } from "@/drizzle/types";
import { toMachineDateString } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import EventsList from "./events-list";

export default function WeekCalendar({
	compact = false,
	timezone,
}: {
	compact?: boolean;
	timezone: string;
}) {
	const { projectId } = useParams();

	const currentDate = toMachineDateString(new Date(), timezone);

	const trpc = useTRPC();
	const { data: events, isLoading } = useQuery(
		trpc.events.getByWeek.queryOptions({
			projectId: +projectId!,
		}),
	);

	return (
		<div className="flex w-full flex-col md:flex-row">
			{isLoading ? (
				<div className="flex h-full w-full flex-col space-y-2 p-4">
					<Skeleton className="h-[60px] w-full rounded-md bg-muted-foreground/10" />
					<Skeleton className="h-[60px] w-full rounded-md bg-muted-foreground/10" />
				</div>
			) : (
				<EventsList
					events={(events as EventWithCreator[]) ?? []}
					projectId={+projectId!}
					date={currentDate}
					compact={compact}
					timezone={timezone}
				/>
			)}
		</div>
	);
}
