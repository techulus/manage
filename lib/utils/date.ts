import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function toTimeZone(date: Date | string, timeZone: string) {
	return toZonedTime(date, timeZone);
}

export function toUTC(date: Date, timeZone: string) {
	return fromZonedTime(date, timeZone);
}

export function toStartOfDay(date: Date) {
	return startOfDay(date);
}

export function toEndOfDay(date: Date) {
	return endOfDay(date);
}

export function toDateString(date: Date, timeZone: string) {
	return date.toLocaleDateString("en-US", {
		timeZone,
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function toDateTimeString(date: Date, timeZone: string) {
	return date.toLocaleString("en-US", {
		timeZone,
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function toTimeString(date: Date, timeZone: string) {
	return date.toLocaleTimeString("en-US", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function toDateStringWithDay(date: Date, timeZone: string) {
	return date.toLocaleDateString("en-US", {
		timeZone,
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function toMachineDateString(date: Date, timeZone: string) {
	return date.toLocaleDateString("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export const guessTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
