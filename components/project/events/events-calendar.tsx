"use client";

import { Calendar } from "@/components/ui/calendar";
import type { EventWithInvites } from "@/drizzle/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./date-time-picker";
import EventsList from "./events-list";

export default function EventsCalendar({
	projectId,
	userId,
	events,
	selectedDate = new Date().toISOString(),
	compact = false,
	orgSlug,
}: {
	projectId: string;
	userId: string;
	events: EventWithInvites[];
	selectedDate?: string;
	compact?: boolean;
	orgSlug: string;
}) {
	const router = useRouter();

	return (
		<div className="flex w-full flex-col md:flex-row md:space-x-2">
			<div className="p-3 md:hidden">
				<DateTimePicker
					dateOnly
					defaultValue={selectedDate}
					name="date"
					onSelect={(date) => {
						router.push(
							`/${orgSlug}/projects/${projectId}/events?date=${dayjs(date).format("YYYY-MM-DD")}`,
						);
					}}
				/>
			</div>

			<Calendar
				className="hidden md:block"
				mode="single"
				selected={new Date(selectedDate)}
				onDayClick={(date) => {
					router.push(
						`/${orgSlug}/projects/${projectId}/events?date=${dayjs(date).format("YYYY-MM-DD")}`,
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
			/>
		</div>
	);
}
