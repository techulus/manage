import { Greeting } from "@/components/core/greeting";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { calendarEvent, task } from "@/drizzle/schema";
import {
	isSameDate,
	toDateStringWithDay,
	toDateTimeString,
	toEndOfDay,
	toTimeZone,
} from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import { getTimezone } from "@/lib/utils/useOwner";
import { and, asc, lte } from "drizzle-orm";
import { AlertTriangleIcon, CalendarClockIcon, InfoIcon } from "lucide-react";
import { rrulestr } from "rrule";

export default async function Today() {
	const db = await database();

	const timezone = await getTimezone();
	const today = toTimeZone(Date(), timezone);

	const [tasks, events] = await Promise.all([
		db.query.task.findMany({
			where: (task, { and, isNotNull, lte, ne }) =>
				and(
					lte(task.dueDate, toEndOfDay(today)),
					ne(task.status, "done"),
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
						status: true,
						name: true,
					},
					with: {
						project: {
							columns: {
								name: true,
							},
						},
					},
				},
			},
		}),
		db.query.calendarEvent.findMany({
			where: and(lte(calendarEvent.start, today)),
			orderBy: [asc(calendarEvent.start)],
		}),
	]);

	const dueToday = tasks
		.filter((t) => t.taskList.status !== "archived")
		.filter((t) => isSameDate(t.dueDate!, new Date()));

	const overDue = tasks
		.filter((t) => t.taskList.status !== "archived")
		.filter((t) => t.dueDate! < new Date());

	const summary = ` You've got ${dueToday.length > 0 ? dueToday.length : "no"} tasks due today, ${overDue.length > 0 ? overDue.length : "no"} overdue tasks and ${events.length > 0 ? events.length : "no"} events today.`;

	return (
		<>
			<PageTitle title={toDateStringWithDay(today, timezone)} />

			<PageSection topInset>
				<p className="p-4 text-xl">
					<Greeting /> {summary}
				</p>
			</PageSection>

			{events.length ? (
				<PageSection>
					<p className="flex items-center p-4 text-xl font-medium text-primary">
						<CalendarClockIcon className="w-6 h-6 inline-block mr-1" />
						Events
					</p>
					{events.map((event) => (
						<div key={event.id} className="px-4 py-2">
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
						</div>
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

							{overDue.map((task) => TaskItem(task))}
						</>
					) : null}

					{dueToday.length ? (
						<>
							<p className="flex items-center p-4 text-xl font-medium text-orange-600">
								<InfoIcon className="w-6 h-6 inline-block mr-1" />
								Due Today
							</p>
							{dueToday.map((task) => TaskItem(task))}
						</>
					) : null}
				</PageSection>
			) : null}
		</>
	);
}
function TaskItem(task: {
	name: string;
	id: number;
	taskList: { name: string; status: string; project: { name: string } };
}) {
	return (
		<div key={task.id} className="px-4 py-2">
			<p className="text-sm text-gray-500 dark:text-gray-400">
				{task.taskList.project.name} - {task.taskList.name}
			</p>
			<p>{task.name}</p>
		</div>
	);
}
