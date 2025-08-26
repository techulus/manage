"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Kbd } from "@/components/ui/kbd";
import type { CalendarEvent } from "@/drizzle/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toDateString, toTimeString, toTimeZone } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import {
	add,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	getDay,
	isEqual,
	isSameDay,
	isSameMonth,
	isToday,
	parse,
	startOfMonth,
	startOfToday,
	startOfWeek,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { rrulestr } from "rrule";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

interface Event {
	id: number;
	name: string;
	time: string;
	datetime: string;
	start: Date;
	end?: Date;
	allDay: boolean;
}

interface CalendarData {
	day: Date;
	events: Event[];
}

interface FullScreenCalendarProps {
	projectId: number;
	timezone: string;
	onSelectDay?: (day: string) => void;
}

const colStartClasses = [
	"",
	"col-start-2",
	"col-start-3",
	"col-start-4",
	"col-start-5",
	"col-start-6",
	"col-start-7",
];

export function FullCalendar({
	projectId,
	timezone,
	onSelectDay,
}: FullScreenCalendarProps) {
	const today = startOfToday();

	const [_, setCreate] = useQueryState(
		"create",
		parseAsBoolean.withDefault(false),
	);

	useKeyboardShortcut("n", () => setCreate(true));

	const [selectedDay, setSelectedDay] = useState(today);
	const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
	const firstDayCurrentMonth = useMemo(
		() => parse(currentMonth, "MMM-yyyy", new Date()),
		[currentMonth],
	);

	const isMobile = useIsMobile();

	const days = useMemo(
		() =>
			eachDayOfInterval({
				start: startOfWeek(firstDayCurrentMonth),
				end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
			}),
		[firstDayCurrentMonth],
	);

	const previousMonth = useCallback(() => {
		const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
		setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
	}, [firstDayCurrentMonth]);

	const nextMonth = useCallback(() => {
		const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
		setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
	}, [firstDayCurrentMonth]);

	const goToToday = useCallback(() => {
		setCurrentMonth(format(today, "MMM-yyyy"));
	}, [today]);

	const onSelect = useCallback(
		(day: Date) => {
			setSelectedDay(day);
			onSelectDay?.(day.toISOString());
		},
		[onSelectDay],
	);

	const trpc = useTRPC();
	const { data: monthEvents } = useQuery(
		trpc.events.getByMonth.queryOptions({
			projectId,
			date: firstDayCurrentMonth,
		}),
	);

	const eventsByDay = useMemo(() => {
		return (monthEvents ?? []).reduce(
			(acc, event) => {
				if (event.repeatRule) {
					const rrule = rrulestr(event.repeatRule);
					const monthStart = startOfMonth(firstDayCurrentMonth);
					const monthEnd = endOfMonth(firstDayCurrentMonth);

					const occurrences = rrule.between(monthStart, monthEnd, true);

					for (const occurrence of occurrences) {
						const day = format(toTimeZone(occurrence, timezone), "yyyy-MM-dd");
						acc[day] = [...(acc[day] || []), event];
					}
				} else if (event.end) {
					const range = eachDayOfInterval({
						start: toTimeZone(event.start, timezone),
						end: toTimeZone(event.end, timezone),
					});

					for (const date of range) {
						const day = format(toTimeZone(date, timezone), "yyyy-MM-dd");
						acc[day] = [...(acc[day] || []), event];
					}
				} else {
					const day = format(toTimeZone(event.start, timezone), "yyyy-MM-dd");
					acc[day] = [...(acc[day] || []), event];
				}

				return acc;
			},
			{} as Record<string, CalendarEvent[]>,
		);
	}, [monthEvents, timezone, firstDayCurrentMonth]);

	const data: CalendarData[] = useMemo(() => {
		return Object.entries(eventsByDay).map(([day, events]) => ({
			day: toTimeZone(day, timezone),
			events: events.map((e) => ({
				id: e.id,
				name: e.name,
				time: e.allDay ? "All Day" : toTimeString(e.start, timezone),
				datetime: toDateString(e.start, timezone),
				start: toTimeZone(e.start, timezone),
				end: e.end ? toTimeZone(e.end, timezone) : undefined,
				allDay: e.allDay,
			})),
		}));
	}, [eventsByDay, timezone]);

	return (
		<div className="flex flex-1 flex-col" suppressHydrationWarning>
			{/* Calendar Header */}
			<div className="flex flex-col space-y-4 pb-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
				<div className="flex flex-auto">
					<div className="flex items-center gap-4">
						<div className="w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 flex">
							<h1 className="p-1 text-xs uppercase text-muted-foreground">
								{format(today, "MMM")}
							</h1>
							<div className="flex w-full text-primary items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
								<span>{format(today, "d")}</span>
							</div>
						</div>
						<div className="flex flex-col">
							<h2 className="text-lg font-semibold text-foreground">
								{format(firstDayCurrentMonth, "MMMM, yyyy")}
							</h2>
							<p className="text-sm text-muted-foreground">
								{format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
								{format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4 flex-row gap-6">
					<div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
						<Button
							onClick={previousMonth}
							className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
							variant="outline"
							size="icon"
							aria-label="Navigate to previous month"
						>
							<ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
						</Button>
						<Button
							onClick={goToToday}
							className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
							variant="outline"
						>
							Today
						</Button>
						<Button
							onClick={nextMonth}
							className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
							variant="outline"
							size="icon"
							aria-label="Navigate to next month"
						>
							<ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
						</Button>
					</div>

					<Separator orientation="vertical" className="h-6 block" />

					<Button
						className="w-full gap-2 md:w-auto"
						onClick={() => setCreate(true)}
						aria-keyshortcuts="N"
					>
						<span>New</span>
						<Kbd className="hidden md:inline-flex">N</Kbd>
					</Button>
				</div>
			</div>

			{/* Calendar Grid */}
			<div className="lg:flex lg:flex-auto lg:flex-col">
				{/* Week Days Header */}
				<div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none text-muted-foreground">
					<div className="border-r py-2.5">Sun</div>
					<div className="border-r py-2.5">Mon</div>
					<div className="border-r py-2.5">Tue</div>
					<div className="border-r py-2.5">Wed</div>
					<div className="border-r py-2.5">Thu</div>
					<div className="border-r py-2.5">Fri</div>
					<div className="py-2.5">Sat</div>
				</div>

				{/* Calendar Days */}
				<div className="flex text-xs leading-6 lg:flex-auto">
					<div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
						{days.map((day, dayIdx) =>
							isMobile ? (
								<button
									onClick={() => onSelect(day)}
									key={day.toISOString()}
									type="button"
									className={cn(
										isEqual(day, selectedDay) && "text-primary-foreground",
										!isEqual(day, selectedDay) &&
											!isToday(day) &&
											isSameMonth(day, firstDayCurrentMonth) &&
											"text-foreground",
										!isEqual(day, selectedDay) &&
											!isToday(day) &&
											!isSameMonth(day, firstDayCurrentMonth) &&
											"text-muted-foreground",
										(isEqual(day, selectedDay) || isToday(day)) &&
											"font-semibold",
										"flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
									)}
								>
									<time
										dateTime={format(day, "yyyy-MM-dd")}
										className={cn(
											"ml-auto flex size-6 items-center justify-center rounded-full",
											isEqual(day, selectedDay) &&
												isToday(day) &&
												"text-primary",
											isEqual(day, selectedDay) &&
												!isToday(day) &&
												"text-primary",
										)}
									>
										{format(day, "d")}
									</time>
									{data.filter((date) => isSameDay(date.day, day)).length >
										0 && (
										<div>
											{data
												.filter((date) => isSameDay(date.day, day))
												.map((date) => (
													<div
														key={date.day.toString()}
														className="-mx-0.5 mt-auto flex flex-wrap-reverse"
													>
														{date.events.map((event) => (
															<span
																key={event.id}
																className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
															/>
														))}
													</div>
												))}
										</div>
									)}
								</button>
							) : (
								<div
									key={day.toISOString()}
									onClick={() => onSelect(day)}
									onKeyUp={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onSelect(day);
										}
									}}
									className={cn(
										dayIdx === 0 && colStartClasses[getDay(day)],
										!isEqual(day, selectedDay) &&
											!isToday(day) &&
											!isSameMonth(day, firstDayCurrentMonth) &&
											"bg-accent/50 text-muted-foreground",
										"relative flex flex-col border-b border-r hover:bg-muted focus:z-10",
										!isEqual(day, selectedDay) && "hover:bg-accent/75",
									)}
								>
									<header className="flex items-center justify-between p-2.5">
										<button
											type="button"
											className={cn(
												isEqual(day, selectedDay) && "text-primary-foreground",
												!isEqual(day, selectedDay) &&
													!isToday(day) &&
													isSameMonth(day, firstDayCurrentMonth) &&
													"text-foreground",
												!isEqual(day, selectedDay) &&
													!isToday(day) &&
													!isSameMonth(day, firstDayCurrentMonth) &&
													"text-muted-foreground",
												isEqual(day, selectedDay) &&
													isToday(day) &&
													"border-none bg-primary",
												isEqual(day, selectedDay) &&
													!isToday(day) &&
													"bg-foreground",
												(isEqual(day, selectedDay) || isToday(day)) &&
													"font-semibold",
												"flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
											)}
										>
											<time dateTime={format(day, "yyyy-MM-dd")}>
												{format(day, "d")}
											</time>
										</button>
									</header>
									<div className="flex-1 p-1.5">
										{data
											.filter((event) => isSameDay(event.day, day))
											.map((day) => (
												<div key={day.day.toString()} className="space-y-1">
													{day.events.slice(0, 3).map((event) => (
														<div
															key={event.id}
															className={cn(
																"flex flex-col items-start gap-1 bg-muted/50 p-1.5 text-xs leading-tight rounded-md border",
																event.allDay ? "bg-primary/20" : "",
															)}
														>
															<p className="font-medium leading-none">
																<span className="leading-none text-muted-foreground mr-1">
																	{event.time}
																</span>
																{event.name}
															</p>
														</div>
													))}
													{day.events.length > 3 && (
														<div className="text-xs text-muted-foreground">
															+ {day.events.length - 3} more
														</div>
													)}
												</div>
											))}
									</div>
								</div>
							),
						)}
					</div>

					<div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
						{days.map((day) => (
							<button
								onClick={() => onSelect(day)}
								key={day.toISOString()}
								type="button"
								className={cn(
									isEqual(day, selectedDay) && "text-primary-foreground",
									!isEqual(day, selectedDay) &&
										!isToday(day) &&
										isSameMonth(day, firstDayCurrentMonth) &&
										"text-foreground",
									!isEqual(day, selectedDay) &&
										!isToday(day) &&
										!isSameMonth(day, firstDayCurrentMonth) &&
										"text-muted-foreground",
									(isEqual(day, selectedDay) || isToday(day)) &&
										"font-semibold",
									"flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
								)}
							>
								<time
									dateTime={format(day, "yyyy-MM-dd")}
									className={cn(
										"ml-auto flex size-6 items-center justify-center rounded-full",
										isEqual(day, selectedDay) && isToday(day) && "text-primary",
										isEqual(day, selectedDay) &&
											!isToday(day) &&
											"text-primary",
									)}
								>
									{format(day, "d")}
								</time>
								{data.filter((date) => isSameDay(date.day, day)).length > 0 && (
									<div>
										{data
											.filter((date) => isSameDay(date.day, day))
											.map((date) => (
												<div
													key={date.day.toString()}
													className="-mx-0.5 mt-auto flex flex-wrap-reverse"
												>
													{date.events.map((event) => (
														<span
															key={event.id}
															className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
														/>
													))}
												</div>
											))}
									</div>
								)}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
