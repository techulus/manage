export function toTimeZone(date: Date, timeZone: string) {
	return new Date(date.toLocaleString("en-US", { timeZone }));
}

export function toStartOfDay(date: Date) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		0,
		0,
		0,
		0,
	);
}

export function toEndOfDay(date: Date) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		23,
		59,
		59,
		999,
	);
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

export function isSameDate(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export const guessTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
