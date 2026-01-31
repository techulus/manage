import {
	and,
	asc,
	between,
	desc,
	eq,
	gt,
	inArray,
	isNotNull,
	isNull,
	lt,
	or,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { calendarEvent, project, task, taskList } from "@/drizzle/schema";
import { TaskListStatus, TaskStatus } from "@/drizzle/types";
import { filterByRepeatRule, getStartEndDateRangeInUtc } from "./useEvents";

export async function getTodayDataForUser(
	db: PostgresJsDatabase<typeof import("@/drizzle/schema")>,
	timezone: string,
	orgId: string | null,
	userId: string,
	date: Date = new Date(),
) {
	const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(timezone, date);

	const orgFilter = orgId
		? eq(project.organizationId, orgId)
		: and(isNull(project.organizationId), eq(project.createdByUser, userId));

	const userProjects = await db.query.project.findMany({
		where: orgFilter,
		columns: { id: true },
	});

	const projectIds = userProjects.map((p) => p.id);

	if (projectIds.length === 0) {
		return { dueToday: [], overDue: [], events: [] };
	}

	const userTaskLists = await db.query.taskList.findMany({
		where: inArray(taskList.projectId, projectIds),
		columns: { id: true },
	});

	const taskListIds = userTaskLists.map((tl) => tl.id);

	if (taskListIds.length === 0) {
		const events = await db.query.calendarEvent.findMany({
			where: and(
				inArray(calendarEvent.projectId, projectIds),
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
		});

		const filteredEvents = events.filter((event) =>
			filterByRepeatRule(event, date, timezone),
		);

		return { dueToday: [], overDue: [], events: filteredEvents };
	}

	const [tasksDueToday, overDueTasks, events] = await Promise.all([
		db.query.task.findMany({
			where: and(
				inArray(task.taskListId, taskListIds),
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
		db.query.task.findMany({
			where: and(
				inArray(task.taskListId, taskListIds),
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
		db.query.calendarEvent.findMany({
			where: and(
				inArray(calendarEvent.projectId, projectIds),
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

	const dueToday = tasksDueToday.filter(
		(t) => t.taskList?.status !== TaskListStatus.ARCHIVED,
	);

	const overDue = overDueTasks.filter(
		(t) => t.taskList?.status !== TaskListStatus.ARCHIVED,
	);

	const filteredEvents = events.filter((event) =>
		filterByRepeatRule(event, date, timezone),
	);

	return {
		dueToday,
		overDue,
		events: filteredEvents,
	};
}
