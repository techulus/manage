"use client";

import { Calendar } from "@/components/ui/calendar";
import type { EventWithInvites } from "@/drizzle/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import EventsList from "./events-list";

export default function EventsCalendar({
	projectId,
	userId,
	events,
	selectedDate = dayjs().format("YYYY-MM-DD"),
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

	return (
		<div className="flex w-full flex-col md:flex-row md:space-x-2">
			<Calendar
				className="block mx-auto md:mx-0"
				mode="single"
				selected={new Date(selectedDate)}
				onDayClick={(date) => {
					router.push(
						`/${orgSlug}/projects/${projectId}/events?on=${dayjs(date).format("YYYY-MM-DD")}`,
					);
				}}
			/>

			<EventsList
				orgSlug={orgSlug}
				events={events}
				projectId={projectId}
				userId={userId}
				date={selectedDate}
				compact={compact}
				timezone={timezone}
			/>
		</div>
	);
}
