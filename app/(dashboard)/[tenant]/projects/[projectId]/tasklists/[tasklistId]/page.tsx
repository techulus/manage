import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { task, taskList, user } from "@/drizzle/schema";
import { toDateStringWithDay } from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { getAllUsers } from "@/lib/utils/useUser";
import { and, asc, eq } from "drizzle-orm";
import { CheckCircle, ClockIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
	createTask,
	getActiveTaskLists,
	partialUpdateTaskList,
} from "../actions";

type Props = {
	params: Promise<{
		projectId: string;
		tasklistId: string;
	}>;
};

export default async function TaskLists(props: Props) {
	const params = await props.params;
	const { userId, orgSlug } = await getOwner();
	const { projectId, tasklistId } = params;

	const timezone = await getTimezone();
	const db = await database();
	const list = await db.query.taskList
		.findFirst({
			where: and(
				eq(taskList.projectId, +projectId),
				eq(taskList.id, +tasklistId),
			),
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

	if (!list) {
		return notFound();
	}

	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, userId),
	});

	if (!currentUser) {
		return notFound();
	}

	const allTaskListsPromise = getActiveTaskLists(+projectId);
	const allUsersPromise = getAllUsers(true);

	const totalCount = list.tasks.length;
	const doneCount = list.tasks.filter((task) => task.status === "done").length;

	const completedPercent =
		totalCount && doneCount
			? Math.round((doneCount / totalCount) * 100)
			: undefined;

	return (
		<>
			<PageTitle
				title={list.name}
				actionLabel="Edit"
				actionLink={`/${orgSlug}/projects/${projectId}/tasklists/${list.id}/edit`}
			>
				<div className="flex flex-col pr-4 md:pr-0 space-y-2 md:flex-row md:space-y-0 md:space-x-2 text-gray-500 dark:text-gray-400">
					{totalCount != null && doneCount != null ? (
						<div className="flex w-[280px] flex-row items-center border rounded-lg py-1 px-2 space-x-2">
							<CheckCircle className="w-4 h-4" />
							<p className="block">
								{doneCount} of {totalCount}
							</p>

							{completedPercent ? (
								<>
									<Progress
										className="h-3 max-w-[130px]"
										value={completedPercent}
									/>
									<span className="ml-2">{completedPercent}%</span>
								</>
							) : null}
						</div>
					) : null}

					{list.dueDate ? (
						<div className="flex flex-row items-center border rounded-lg py-1 px-2 space-x-2">
							<ClockIcon className="w-4 h-4" />
							<p className="block">
								{list.dueDate ? (
									<span suppressHydrationWarning>
										Due {toDateStringWithDay(list.dueDate, timezone)}
									</span>
								) : null}
							</p>
						</div>
					) : null}
				</div>
			</PageTitle>

			<div className="mx-auto -mt-8 max-w-7xl">
				<Suspense
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
						timezone={timezone}
						key={list.id}
						taskList={list}
						projectId={+projectId}
						userId={userId}
						createTask={createTask}
						orgSlug={orgSlug}
						partialUpdateTaskList={partialUpdateTaskList}
						taskListsPromise={allTaskListsPromise}
						usersPromise={allUsersPromise}
						hideHeader
					/>
				</Suspense>

				<div className="py-8">
					{/* @ts-ignore */}
					<CommentsSection
						type="tasklist"
						parentId={+tasklistId}
						projectId={+projectId}
					/>
				</div>
			</div>
		</>
	);
}
