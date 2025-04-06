import { Greeting } from "@/components/core/greeting";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { calendarEvent, task } from "@/drizzle/schema";
import { toDateStringWithDay, toDateTimeString } from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import {
	filterByRepeatRule,
	getStartEndDateRangeInUtc,
} from "@/lib/utils/useEvents";
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

	const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(timezone, today);

	const [tasksDueToday, overDueTasks, events] = await Promise.all([
		db.query.task.findMany({
			where: and(
				between(task.dueDate, startOfDay, endOfDay),
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
				lt(task.dueDate, startOfDay),
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
		(t) => t.taskList?.status !== "archived",
	);

	const overDue = overDueTasks.filter((t) => t.taskList?.status !== "archived");

	const filteredEvents = events.filter((event) =>
		filterByRepeatRule(event, new Date(today), timezone),
	);

	const { tenant } = await props.params;

	return (
		<>
			<PageTitle title={toDateStringWithDay(today, timezone)} />

			<div className="max-w-5xl mx-auto -mt-10 bg-background px-6 lg:px-0 pb-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="col-span-1 md:col-span-3 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-none">
						<h2 className="text-2xl font-semibold">
							<Greeting timezone={timezone} />
						</h2>
					</Card>
					<Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-none">
						<div className="flex flex-col items-center justify-center h-full">
							<span className="text-3xl font-bold text-orange-500">
								{dueToday.length}
							</span>
							<span className="text-sm text-muted-foreground mt-1">
								Due Today
							</span>
						</div>
					</Card>
					<Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-none">
						<div className="flex flex-col items-center justify-center h-full">
							<span className="text-3xl font-bold text-red-500">
								{overDue.length}
							</span>
							<span className="text-sm text-muted-foreground mt-1">
								Overdue
							</span>
						</div>
					</Card>
					<Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-none">
						<div className="flex flex-col items-center justify-center h-full">
							<span className="text-3xl font-bold text-blue-500">
								{filteredEvents.length}
							</span>
							<span className="text-sm text-muted-foreground mt-1">Events</span>
						</div>
					</Card>
				</div>
			</div>

			{filteredEvents.length ? (
				<PageSection>
					<div className="flex items-center justify-between p-4">
						<h3 className="flex items-center text-lg font-medium text-primary">
							<CalendarClockIcon className="w-6 h-6 mr-2" />
							Events
						</h3>
					</div>
					<div className="space-y-3">
						{filteredEvents.map((event) => (
							<Link
								href={`/${tenant}/projects/${event.project.id}/events`}
								key={event.id}
							>
								<Card className="p-4 hover:bg-muted/50 transition-colors border-none">
									<div className="flex flex-col space-y-2">
										<div className="flex items-start justify-between">
											<h4 className="font-medium">{event.name}</h4>
											<Badge variant={event.allDay ? "outline" : "secondary"}>
												{event.allDay ? "All Day" : "Timed"}
											</Badge>
										</div>
										<div
											className="text-sm text-muted-foreground"
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
										</div>
										{event.repeatRule && (
											<div className="text-xs text-muted-foreground">
												↻ {rrulestr(event.repeatRule).toText()}
											</div>
										)}
										{event.description && (
											<p className="text-sm mt-2 text-muted-foreground">
												{event.description}
											</p>
										)}
										<div className="text-xs text-primary mt-2">
											{event.project.name}
										</div>
									</div>
								</Card>
							</Link>
						))}
					</div>
				</PageSection>
			) : null}

			{overDue.length || dueToday.length ? (
				<PageSection>
					{overDue.length ? (
						<>
							<div className="flex items-center justify-between p-4">
								<h3 className="flex items-center text-lg font-medium text-red-600 dark:text-red-500">
									<AlertTriangleIcon className="w-6 h-6 mr-2" />
									Overdue
								</h3>
							</div>
							{overDue.map((task) => TaskItem(tenant, task))}
						</>
					) : null}

					{dueToday.length ? (
						<>
							<div className="flex items-center justify-between p-4">
								<h3 className="flex items-center text-lg font-medium text-orange-600">
									<InfoIcon className="w-6 h-6 mr-2" />
									Due Today
								</h3>
							</div>
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
		>
			<Card className="px-4 py-2 hover:bg-muted/50 transition-colors border-none">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h4 className="font-medium">{task.name}</h4>
						<div className="text-sm text-muted-foreground">
							<span className="text-primary">{task.taskList.project.name}</span>{" "}
							• {task.taskList.name}
						</div>
					</div>
				</div>
			</Card>
		</Link>
	);
}
