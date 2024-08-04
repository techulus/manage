import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { buttonVariants } from "@/components/ui/button";
import { task, taskList, user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { and, asc, eq, or } from "drizzle-orm";
import Link from "next/link";
import { createTask, partialUpdateTaskList } from "./actions";

type Props = {
	params: {
		projectId: string;
	};
	searchParams: {
		status?: string;
	};
};

export default async function TaskLists({ params, searchParams }: Props) {
	const { userId, orgId } = await getOwner();
	const { projectId } = params;

	const filterByStatuses = searchParams.status?.split(",") ?? ["active"];
	const statusFilter = filterByStatuses.map((status) =>
		eq(taskList.status, status),
	);

	const db = await database();
	const taskLists = await db.query.taskList
		.findMany({
			where: and(eq(taskList.projectId, +projectId), or(...statusFilter)),
			with: {
				tasks: {
					orderBy: [asc(task.position)],
					with: {
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
				},
			},
		})
		.execute();

	const archivedTaskLists = await db.query.taskList
		.findMany({
			columns: {
				id: true,
			},
			where: and(
				eq(taskList.projectId, +projectId),
				eq(taskList.status, "archived"),
			),
		})
		.execute();

	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, userId),
	});

	const orgUsers = orgId ? await db.query.user.findMany() : [];

	const users: User[] = orgId ? orgUsers : [currentUser!];

	return (
		<>
			<PageTitle
				title="Task Lists"
				actionLabel="New"
				actionLink={`/console/projects/${projectId}/tasklists/new`}
			/>

			<div className="mx-auto my-12 -mt-6 max-w-5xl px-4">
				<EmptyState
					show={!taskLists.length}
					label="task list"
					createLink={`/console/projects/${projectId}/tasklists/new`}
				/>

				<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
					{taskLists.map((taskList) => (
						<TaskListItem
							key={taskList.id}
							taskList={taskList}
							projectId={+projectId}
							userId={userId}
							users={users}
							createTask={createTask}
							partialUpdateTaskList={partialUpdateTaskList}
							hideDone
						/>
					))}
				</ul>

				{archivedTaskLists.length > 0 && (
					<div className="mt-12 flex w-full flex-grow items-center border-t border-muted p-4 md:py-4">
						<p className="text-sm text-muted-foreground">
							{archivedTaskLists.length} archived task list(s)
						</p>

						{filterByStatuses.includes("archived") ? (
							<Link
								href={`/console/projects/${projectId}/tasklists`}
								className={buttonVariants({ variant: "link" })}
								prefetch={false}
							>
								Hide
							</Link>
						) : (
							<Link
								href={`/console/projects/${projectId}/tasklists?status=active,archived`}
								className={buttonVariants({ variant: "link" })}
								prefetch={false}
							>
								Show
							</Link>
						)}
					</div>
				)}
			</div>
		</>
	);
}
