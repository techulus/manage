import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { task, taskList, user } from "@/drizzle/schema";
import { User } from "@/drizzle/types";
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
  const { userId, orgId } = getOwner();
  const { projectId, tasklistId } = params;

  const list = await database()
    .query.taskList.findFirst({
      where: and(
        eq(taskList.projectId, +projectId),
        eq(taskList.id, +tasklistId)
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

  const currentUser = await database().query.user.findFirst({
    where: eq(user.id, userId),
  });

  const orgUsers = orgId ? await database().query.user.findMany() : [];

  const users: User[] = orgId ? orgUsers : [currentUser!];

  return (
    <>
      <PageTitle
        title={list.name}
        backUrl={`/console/projects/${projectId}/tasklists`}
      />

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0 xl:-mt-8">
        <TaskListItem
          key={list.id}
          taskList={list}
          projectId={+projectId}
          userId={userId}
          users={users}
          createTask={createTask}
          partialUpdateTaskList={partialUpdateTaskList}
          hideHeader
        />

        <div className="border-t pb-12 pt-4">
          {/* @ts-ignore */}
          <CommentsSection type="tasklist" parentId={+tasklistId} />
        </div>
      </div>
    </>
  );
}
