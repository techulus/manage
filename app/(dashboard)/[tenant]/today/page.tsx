import { Greeting } from "@/components/core/greeting";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { calendarEvent, task } from "@/drizzle/schema";
import {
	toDateStringWithDay,
	toDateTimeString,
	toEndOfDay,
	toStartOfDay,
	toTimeZone,
	toUTC,
} from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import { filterByRepeatRule } from "@/lib/utils/useEvents";
import { getTimezone } from "@/lib/utils/useOwner";
import {
	and,
	asc,
	between,
	desc,
	eq,
	gt,
	isNotNull,
	lt,
	lte,
	ne,
	or,
} from "drizzle-orm";
import { AlertTriangleIcon, CalendarClockIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { rrulestr } from "rrule";

export default async function Today(props: {
	params: Promise<{
		tenant: string;
	}>;
}) {
	const db = await database();

	const timezone = await getTimezone();
	const today = new Date();

	const startOfTodayInUserTZ = toStartOfDay(toTimeZone(new Date(), timezone));
	const endOfTodayInUserTZ = toEndOfDay(toTimeZone(new Date(), timezone));
	const startOfDay = toUTC(startOfTodayInUserTZ, timezone);
	const endOfDay = toUTC(endOfTodayInUserTZ, timezone);

	const taskQueryOptions = {
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
	};

	const [tasksDueToday, overDueTasks, events] = await Promise.all([
		db.query.task.findMany({
			where: and(
				between(task.dueDate, startOfDay, endOfDay),
				ne(task.status, "done"),
				isNotNull(task.dueDate),
			),
			orderBy: [asc(task.position)],
			...taskQueryOptions,
		}),
		db.query.task.findMany({
			where: and(
				lt(task.dueDate, startOfDay),
				ne(task.status, "done"),
				isNotNull(task.dueDate),
			),
			orderBy: [asc(task.position)],
			...taskQueryOptions,
		}),
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

	const dueToday = tasksDueToday.filter(
		(t) => t.taskList.status !== "archived",
	);

	const overDue = overDueTasks.filter((t) => t.taskList.status !== "archived");

	const filteredEvents = events.filter((event) =>
		filterByRepeatRule(event, new Date(today)),
	);

	const summary = ` You've got ${dueToday.length > 0 ? dueToday.length : "no"} task(s) due today, ${overDue.length > 0 ? overDue.length : "no"} overdue task(s) and ${filteredEvents.length > 0 ? filteredEvents.length : "no"} event(s) today.`;

	const { tenant } = await props.params;

	return (
		<>
			<PageTitle title={toDateStringWithDay(today, timezone)} />

			<PageSection topInset>
				<p className="p-4 text-xl">
					<Greeting /> {summary}
				</p>
			</PageSection>

			{filteredEvents.length ? (
				<PageSection>
					<p className="flex items-center p-4 text-xl font-medium text-primary">
						<CalendarClockIcon className="w-6 h-6 inline-block mr-1" />
						Events
					</p>
					{filteredEvents.map((event) => (
						<Link
							href={`/${tenant}/projects/${event.project.id}/events`}
							key={event.id}
							className="px-4 py-2"
						>
							<div className="flex flex-col md:flex-row md:items-center md:space-x-4">
								<p>{event.name}</p>
								<div
									className="text-xs text-gray-500 dark:text-gray-400"
									suppressHydrationWarning
								>
									{event.allDay
										? toDateStringWithDay(event.start, timezone)
										: toDateTimeString(event.start, timezone)}
									{event.end
										? ` - ${
												event.allDay
													? toDateStringWithDay(event.end, timezone)
													: toDateTimeString(event.end, timezone)
											}`
										: null}
									{event.repeatRule
										? `, ${rrulestr(event.repeatRule).toText()}`
										: null}
								</div>
							</div>
							<p className="text-sm">{event.description}</p>
						</Link>
					))}
				</PageSection>
			) : null}

			{overDue.length || dueToday.length ? (
				<PageSection>
					{overDue.length ? (
						<>
							<p className="flex items-center p-4 text-xl font-medium text-red-600">
								<AlertTriangleIcon className="w-6 h-6 inline-block mr-1" />
								Overdue
							</p>

							{overDue.map((task) => TaskItem(tenant, task))}
						</>
					) : null}

					{dueToday.length ? (
						<>
							<p className="flex items-center p-4 text-xl font-medium text-orange-600">
								<InfoIcon className="w-6 h-6 inline-block mr-1" />
								Due Today
							</p>
							{dueToday.map((task) => TaskItem(tenant, task))}
						</>
					) : null}
				</PageSection>
			) : null}
		</>
	);
}
function TaskItem(
	tenant: string,
	task: {
		name: string;
		id: number;
		taskList: {
			id: number;
			name: string;
			status: string;
			project: { id: number; name: string };
		};
	},
) {
	return (
		<Link
			href={`/${tenant}/projects/${task.taskList.project.id}/tasklists/${task.taskList.id}`}
			key={task.id}
			className="px-4 py-2"
		>
			<p className="text-sm text-gray-500 dark:text-gray-400">
				{task.taskList.project.name} - {task.taskList.name}
			</p>
			<p>{task.name}</p>
		</Link>
	);
}
