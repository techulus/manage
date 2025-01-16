import type { CalendarEvent, EventWithInvites } from "@/drizzle/types";
import { rrulestr } from "rrule";
import { toEndOfDay, toStartOfDay } from "./date";

export const filterByRepeatRule = (
	event: CalendarEvent | EventWithInvites,
	date: Date,
) => {
	if (event.repeatRule) {
		const rrule = rrulestr(event.repeatRule);
		const start = toStartOfDay(date);
		const end = toEndOfDay(date);

		return rrule.between(start, end, true).length > 0;
	}

	return true;
};
