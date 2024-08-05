import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { Badge } from "@/components/ui/badge";
import { task, taskList, user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { createTask, partialUpdateTaskList } from "../actions";

type Props = {
	params: {
		projectId: string;
		tasklistId: string;
	};
};

export default async function TaskLists({ params }: Props) {
	const { userId, orgId, orgSlug } = await getOwner();
	const { projectId, tasklistId } = params;

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

	const orgUsers = orgId ? await db.query.user.findMany() : [];

	const users: User[] = orgId ? orgUsers : [currentUser];

	const totalCount = list.tasks.length;
	const doneCount = list.tasks.filter((task) => task.status === "done").length;

	return (
		<>
			<PageTitle
				title={list.name}
				backUrl={`/${orgSlug}/projects/${projectId}/tasklists`}
				actionLabel="Edit"
				actionLink={`/${orgSlug}/projects/${projectId}/tasklists/${list.id}/edit`}
			>
				<div className="flex space-x-2">
					{totalCount != null && doneCount != null ? (
						<Badge variant="outline">
							{doneCount}/{totalCount} completed
						</Badge>
					) : null}
					{list.dueDate ? (
						<Badge variant="outline" className="ml-2" suppressHydrationWarning>
							Due {list.dueDate.toLocaleDateString()}
						</Badge>
					) : null}
				</div>
			</PageTitle>

			<div className="mx-auto -mt-8 max-w-5xl px-4">
				<TaskListItem
					key={list.id}
					taskList={list}
					projectId={+projectId}
					userId={userId}
					users={users}
					createTask={createTask}
					orgSlug={orgSlug}
					partialUpdateTaskList={partialUpdateTaskList}
					hideHeader
				/>

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
