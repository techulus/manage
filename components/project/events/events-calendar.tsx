"use client";

import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventWithCreator } from "@/drizzle/types";
import { toMachineDateString } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import EventsList from "./events-list";

export default function EventsCalendar({
	compact = false,
	timezone,
}: {
	compact?: boolean;
	timezone: string;
}) {
	const { projectId } = useParams();

	const [on, setOn] = useQueryState("on");
	const currentDate = toMachineDateString(
		on ? new Date(on) : new Date(),
		timezone,
	);

	const trpc = useTRPC();
	const { data: events, isLoading } = useQuery({
		...trpc.events.getByDate.queryOptions({
			date: on ? new Date(on) : new Date(),
			projectId: +projectId!,
		}),
		queryHash: `events-${currentDate}-${projectId}`,
	});

	return (
		<div className="flex w-full flex-col md:flex-row md:space-x-2">
			<Calendar
				className="block mx-auto md:mx-0"
				mode="single"
				selected={new Date(currentDate)}
				onDayClick={(date) => {
					setOn(toMachineDateString(date, timezone));
				}}
			/>

			{isLoading ? (
				<div className="flex h-full w-full flex-col space-y-2 p-4">
					<Skeleton className="h-[60px] w-full rounded-md bg-muted-foreground/10" />
					<Skeleton className="h-[60px] w-full rounded-md bg-muted-foreground/10" />
				</div>
			) : (
				<div className="flex w-full p-4">
					<EventsList
						events={(events as EventWithCreator[]) ?? []}
						projectId={+projectId!}
						date={currentDate}
						compact={compact}
						timezone={timezone}
					/>
				</div>
			)}
		</div>
	);
}
