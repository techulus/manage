import { Greeting } from "@/components/core/greeting";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { TaskItem } from "@/components/project/tasklist/task/task-item";
import { task } from "@/drizzle/schema";
import { isSameDate } from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import { and, asc, lte, ne } from "drizzle-orm";
import { AlertTriangleIcon, InfoIcon } from "lucide-react";

export default async function Today() {
	const db = await database();

	const tasks = await db.query.task.findMany({
		where: and(lte(task.dueDate, new Date()), ne(task.status, "done")),
		orderBy: [asc(task.position)],
		with: {
			taskList: {
				columns: {
					projectId: true,
				},
			},
			creator: {
				columns: {
					firstName: true,
					imageUrl: true,
				},
			},
			assignee: {
				columns: {
					firstName: true,
					imageUrl: true,
				},
			},
		},
	});

	const dueToday = tasks
		.filter((t) => !!t.dueDate)
		.filter((t) => isSameDate(t.dueDate!, new Date()));

	const overDue = tasks
		.filter((t) => !!t.dueDate)
		.filter((t) => t.dueDate! < new Date());

	const summary = `You've got ${dueToday.length > 0 ? dueToday.length : "no"} tasks due today & ${overDue.length > 0 ? overDue.length : "no"} overdue tasks.`;

	return (
		<>
			<PageTitle title="Today" />

			<PageSection topInset>
				<p className="p-4 text-xl">
					<Greeting />, {summary}
				</p>
			</PageSection>

			{overDue.length || dueToday.length ? (
				<PageSection>
					{overDue.length ? (
						<>
							<p className="flex items-center p-4 text-xl font-medium text-red-600">
								<AlertTriangleIcon className="w-6 h-6 inline-block mr-1" />
								Overdue
							</p>
							{overDue.map((task) => (
								<TaskItem
									key={task.id}
									task={task}
									projectId={+task.taskList.projectId}
									compact
								/>
							))}
						</>
					) : null}

					{dueToday.length ? (
						<>
							<p className="flex items-center p-4 text-xl font-medium text-orange-600">
								<InfoIcon className="w-6 h-6 inline-block mr-1" />
								Due Today
							</p>
							{dueToday.map((task) => (
								<TaskItem
									key={task.id}
									task={task}
									projectId={+task.taskList.projectId}
									compact
								/>
							))}
						</>
					) : null}
				</PageSection>
			) : null}
		</>
	);
}
