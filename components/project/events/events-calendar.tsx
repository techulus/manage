"use client";

import { Calendar } from "@/components/ui/calendar";
import type { EventWithInvites } from "@/drizzle/types";
import { toMachineDateString } from "@/lib/utils/date";
import { useParams, useRouter } from "next/navigation";
import EventsList from "./events-list";

export default function EventsCalendar({
	projectId,
	events,
	selectedDate,
	compact = false,
	timezone,
}: {
	projectId: string;
	events: EventWithInvites[];
	selectedDate?: string;
	compact?: boolean;
	timezone: string;
}) {
	const router = useRouter();
	const { tenant } = useParams();

	const currentDate = toMachineDateString(
		selectedDate ? new Date(selectedDate) : new Date(),
		timezone,
	);

	return (
		<div className="flex w-full flex-col md:flex-row md:space-x-2">
			<Calendar
				className="block mx-auto md:mx-0"
				mode="single"
				selected={new Date(currentDate)}
				onDayClick={(date) => {
					router.push(
						`/${tenant}/projects/${projectId}/events?on=${toMachineDateString(date, timezone)}`,
					);
				}}
			/>

			<EventsList
				events={events}
				projectId={projectId}
				date={currentDate}
				compact={compact}
				timezone={timezone}
			/>
		</div>
	);
}
