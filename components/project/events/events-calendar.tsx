"use client";

import { Calendar } from "@/components/ui/calendar";
import type { EventWithInvites } from "@/drizzle/types";
import { toMachineDateString } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import EventsList from "./events-list";

export default function EventsCalendar({
	projectId,
	userId,
	events,
	selectedDate,
	compact = false,
	timezone,
	orgSlug,
}: {
	projectId: string;
	userId: string;
	events: EventWithInvites[];
	selectedDate?: string;
	compact?: boolean;
	timezone: string;
	orgSlug: string;
}) {
	const router = useRouter();

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
						`/${orgSlug}/projects/${projectId}/events?on=${toMachineDateString(date, timezone)}`,
					);
				}}
			/>

			<EventsList
				orgSlug={orgSlug}
				events={events}
				projectId={projectId}
				userId={userId}
				date={currentDate}
				compact={compact}
				timezone={timezone}
			/>
		</div>
	);
}
