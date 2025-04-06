import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { task, taskList } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { getAllUsers } from "@/lib/utils/useUser";
import { and, asc, eq, or } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import {
	createTask,
	getActiveTaskLists,
	partialUpdateTaskList,
} from "./actions";

type Props = {
	params: Promise<{
		projectId: string;
	}>;
	searchParams: Promise<{
		status?: string;
	}>;
};

export default async function TaskLists(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const { userId, orgSlug } = await getOwner();
	const { projectId } = params;

	const timezone = await getTimezone();
	const filterByStatuses = searchParams.status?.split(",") ?? ["active"];
	const statusFilter = filterByStatuses.map((status) =>
		eq(taskList.status, status),
	);

	const db = await database();
	const [taskLists, archivedTaskLists] = await Promise.all([
		db.query.taskList
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
			.execute(),
		db.query.taskList
			.findMany({
				columns: {
					id: true,
				},
				where: and(
					eq(taskList.projectId, +projectId),
					eq(taskList.status, "archived"),
				),
			})
			.execute(),
	]);

	const allTasklistsPromise = getActiveTaskLists(+projectId);
	const allUsersPromise = getAllUsers(true);

	return (
		<>
			<PageTitle
				title="Task Lists"
				actionLabel="New"
				actionLink={`/${orgSlug}/projects/${projectId}/tasklists/new`}
			/>

			<div className="mx-auto my-12 -mt-6 max-w-7xl">
				<EmptyState
					show={!taskLists.length}
					label="task list"
					createLink={`/${orgSlug}/projects/${projectId}/tasklists/new`}
				/>

				<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
					{taskLists.map((taskList) => (
						<Suspense
							key={taskList.id}
							fallback={
								<div className="max-h-96 w-full rounded-lg border p-4 bg-card">
									<Skeleton className="h-4 w-3/4 mb-4" />
									<Skeleton className="h-4 w-1/2 mb-2" />
									<div className="space-y-3 mt-6">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
									</div>
								</div>
							}
						>
							<TaskListItem
								taskList={taskList}
								projectId={+projectId}
								userId={userId}
								createTask={createTask}
								partialUpdateTaskList={partialUpdateTaskList}
								orgSlug={orgSlug}
								timezone={timezone}
								taskListsPromise={allTasklistsPromise}
								usersPromise={allUsersPromise}
								compact
							/>
						</Suspense>
					))}
				</ul>

				{archivedTaskLists.length > 0 && (
					<div className="mt-12 flex w-full flex-grow items-center border-t border-muted p-4 md:py-4">
						<p className="text-sm text-muted-foreground">
							{archivedTaskLists.length} archived task list(s)
						</p>

						{filterByStatuses.includes("archived") ? (
							<Link
								href={`/${orgSlug}/projects/${projectId}/tasklists`}
								className={buttonVariants({ variant: "link" })}
								prefetch={false}
							>
								Hide
							</Link>
						) : (
							<Link
								href={`/${orgSlug}/projects/${projectId}/tasklists?status=active,archived`}
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
