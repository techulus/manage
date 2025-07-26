import {
	and,
	asc,
	between,
	desc,
	eq,
	gt,
	isNotNull,
	lt,
	or,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { calendarEvent, task } from "@/drizzle/schema";
import { TaskListStatus, TaskStatus } from "@/drizzle/types";
import { filterByRepeatRule, getStartEndDateRangeInUtc } from "./useEvents";

export async function getTodayDataForUser(
	db: PostgresJsDatabase<typeof import("@/drizzle/schema")>,
	timezone: string,
	date: Date = new Date(),
) {
	const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(timezone, date);

	const [tasksDueToday, overDueTasks, events] = await Promise.all([
		// Tasks due today
		db.query.task.findMany({
			where: and(
				between(task.dueDate, startOfDay, endOfDay),
				eq(task.status, TaskStatus.TODO),
				isNotNull(task.dueDate),
			),
			orderBy: [asc(task.position)],
			columns: {
				name: true,
				dueDate: true,
				id: true,
			},
			with: {
				taskList: {
					columns: {
						id: true,
						status: true,
						name: true,
					},
					with: {
						project: {
							columns: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		}),
		// Overdue tasks
		db.query.task.findMany({
			where: and(
				lt(task.dueDate, startOfDay),
				eq(task.status, TaskStatus.TODO),
				isNotNull(task.dueDate),
			),
			orderBy: [asc(task.position)],
			columns: {
				name: true,
				dueDate: true,
				id: true,
			},
			with: {
				taskList: {
					columns: {
						id: true,
						status: true,
						name: true,
					},
					with: {
						project: {
							columns: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		}),
		// Today's events
		db.query.calendarEvent.findMany({
			where: and(
				or(
					between(calendarEvent.start, startOfDay, endOfDay),
					between(calendarEvent.end, startOfDay, endOfDay),
					and(
						lt(calendarEvent.start, startOfDay),
						gt(calendarEvent.end, endOfDay),
					),
					isNotNull(calendarEvent.repeatRule),
					eq(calendarEvent.start, startOfDay),
					eq(calendarEvent.end, endOfDay),
				),
			),
			orderBy: [desc(calendarEvent.start), asc(calendarEvent.allDay)],
			with: {
				project: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		}),
	]);

	// Filter out archived task lists
	const dueToday = tasksDueToday.filter(
		(t) => t.taskList?.status !== TaskListStatus.ARCHIVED,
	);

	const overDue = overDueTasks.filter(
		(t) => t.taskList?.status !== TaskListStatus.ARCHIVED,
	);

	// Filter events by repeat rule
	const filteredEvents = events.filter((event) =>
		filterByRepeatRule(event, date, timezone),
	);

	return {
		dueToday,
		overDue,
		events: filteredEvents,
	};
}
