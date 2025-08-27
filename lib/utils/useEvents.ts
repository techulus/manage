import { endOfMonth, isSameDay, startOfMonth } from "date-fns";
import type * as ical from "node-ical";
import { rrulestr } from "rrule";
import type { calendarEvent } from "@/drizzle/schema";
import type { CalendarEvent, EventWithCreator } from "@/drizzle/types";
import {
	getEndOfWeek,
	getStartOfWeek,
	toDateStringWithDay,
	toDateTimeString,
	toEndOfDay,
	toStartOfDay,
	toTimeString,
	toTimeZone,
	toUTC,
} from "./date";

export type ImportedEvent = Pick<
	typeof calendarEvent.$inferInsert,
	"name" | "description" | "start" | "end" | "allDay" | "repeatRule"
>;

export const filterByRepeatRule = (
	event: CalendarEvent | EventWithCreator,
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

export const getStartEndWeekRangeInUtc = (timezone: string, date: Date) => {
	const startOfWeekInUserTZ = getStartOfWeek(toTimeZone(date, timezone));
	const endOfWeekInUserTZ = getEndOfWeek(toTimeZone(date, timezone));

	return {
		start: toUTC(startOfWeekInUserTZ, timezone),
		end: toUTC(endOfWeekInUserTZ, timezone),
	};
};

export const getStartEndMonthRangeInUtc = (timezone: string, date: Date) => {
	const startOfMonthInUserTZ = startOfMonth(toTimeZone(date, timezone));
	const endOfMonthInUserTZ = endOfMonth(toTimeZone(date, timezone));

	return {
		start: toUTC(startOfMonthInUserTZ, timezone),
		end: toUTC(endOfMonthInUserTZ, timezone),
	};
};

export const eventToHumanReadableString = (
	event: CalendarEvent | EventWithCreator,
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

export function parseRecurrenceRule(rrule?: string): string | null {
	if (!rrule) return null;

	try {
		// If it's already an RRule string, validate and return it
		if (rrule.startsWith("RRULE:")) {
			const parsedRule = rrulestr(rrule);
			return parsedRule.toString();
		}
		return null;
	} catch {
		return null;
	}
}

export function convertIcsEventToImportedEvent(
	event: ical.CalendarComponent,
	timezone: string,
): ImportedEvent | null {
	if (event.type !== "VEVENT") return null;

	const summary = event.summary || "Untitled Event";
	const description = event.description || "";

	let start: Date;
	let end: Date | undefined;
	let allDay = false;

	// Check if this is an all-day event by examining the start time
	// VEvent has start as DateWithTimeZone, but we need to check if it's date-only
	// biome-ignore lint/suspicious/noExplicitAny: node-ical types are incomplete for dateOnly property
	if (event.start && (event.start as any).dateOnly) {
		allDay = true;
		start = toUTC(toStartOfDay(toTimeZone(event.start, timezone)), timezone);
		end = event.end
			? toUTC(toEndOfDay(toTimeZone(event.end, timezone)), timezone)
			: undefined;
	} else if (event.start) {
		start = new Date(event.start);
		end = event.end ? new Date(event.end) : undefined;
	} else {
		// No start date, invalid event
		return null;
	}

	const repeatRule = event.rrule
		? parseRecurrenceRule(event.rrule.toString()) || undefined
		: undefined;

	return {
		name: summary,
		description,
		start,
		end,
		allDay,
		repeatRule,
	};
}
