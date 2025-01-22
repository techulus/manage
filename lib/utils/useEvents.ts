import type { CalendarEvent, EventWithInvites } from "@/drizzle/types";
import { isSameDay } from "date-fns";
import { rrulestr } from "rrule";
import {
	toDateStringWithDay,
	toDateTimeString,
	toEndOfDay,
	toStartOfDay,
	toTimeString,
	toTimeZone,
	toUTC,
} from "./date";

export const filterByRepeatRule = (
	event: CalendarEvent | EventWithInvites,
	date: Date,
	timezone: string,
) => {
	if (event.repeatRule) {
		const rrule = rrulestr(event.repeatRule);
		const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(timezone, date);

		return rrule.between(startOfDay, endOfDay, true).length > 0;
	}

	return true;
};

export const getStartEndDateRangeInUtc = (
	timezone: string,
	date: Date = new Date(),
) => {
	const startOfTodayInUserTZ = toStartOfDay(toTimeZone(date, timezone));
	const endOfTodayInUserTZ = toEndOfDay(toTimeZone(date, timezone));
	const startOfDay = toUTC(startOfTodayInUserTZ, timezone);
	const endOfDay = toUTC(endOfTodayInUserTZ, timezone);

	return {
		startOfDay,
		endOfDay,
	};
};

export const eventToHumanReadableString = (
	event: CalendarEvent | EventWithInvites,
	timezone: string,
) => {
	if (event.repeatRule) {
		const ruleDescription = rrulestr(event.repeatRule).toText();
		if (event.end) {
			return `${ruleDescription}, ${toTimeString(event.start, timezone)} to ${toTimeString(event.end, timezone)}`;
		}

		return ruleDescription;
	}

	if (event.allDay) {
		if (event.end) {
			if (isSameDay(event.start, event.end)) {
				return `${toDateStringWithDay(event.start, timezone)}`;
			}

			return `${toDateStringWithDay(event.start, timezone)} - ${toDateStringWithDay(
				event.end,
				timezone,
			)}`;
		}

		return `All day, ${toDateStringWithDay(event.start, timezone)}`;
	}

	if (event.end) {
		if (isSameDay(event.start, event.end)) {
			return `${toDateTimeString(event.start, timezone)} - ${toTimeString(
				event.end,
				timezone,
			)}`;
		}

		return `${toDateTimeString(event.start, timezone)} - ${toDateTimeString(
			event.end,
			timezone,
		)}`;
	}

	return `${toDateTimeString(event.start, timezone)}`;
};
