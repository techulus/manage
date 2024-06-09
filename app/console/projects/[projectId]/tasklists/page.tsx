import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { buttonVariants } from "@/components/ui/button";
import { task, taskList, user } from "@/drizzle/schema";
import { User } from "@/drizzle/types";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { getProjectById } from "@/lib/utils/useProjects";
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
  const { userId, orgId } = getOwner();
  const { projectId } = params;

  const project = await getProjectById(projectId);

  const filterByStatuses = searchParams.status?.split(",") ?? ["active"];
  const statusFilter = filterByStatuses.map((status) =>
    eq(taskList.status, status)
  );
  const taskLists = await database()
    .query.taskList.findMany({
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

  const archivedTaskLists = await database()
    .query.taskList.findMany({
      columns: {
        id: true,
      },
      where: and(
        eq(taskList.projectId, +projectId),
        eq(taskList.status, "archived")
      ),
    })
    .execute();

  const currentUser = await database().query.user.findFirst({
    where: eq(user.id, userId),
  });

  const orgUsers = orgId ? await database().query.user.findMany() : [];

  const users: User[] = orgId ? orgUsers : [currentUser!];

  return (
    <>
      <PageTitle
        title="Task lists"
        subTitle={project.name}
        backUrl={`/console/projects/${projectId}`}
        actionLabel="New"
        actionLink={`/console/projects/${projectId}/tasklists/new`}
      />

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0">
        <EmptyState
          show={!taskLists.length}
          label="task list"
          createLink={`/console/projects/${projectId}/tasklists/new`}
        />

        <ul role="list" className="mt-6 space-y-6">
          {taskLists.map((taskList) => (
            <>
              <TaskListItem
                key={taskList.id}
                taskList={taskList}
                projectId={+projectId}
                userId={userId}
                users={users}
                createTask={createTask}
                partialUpdateTaskList={partialUpdateTaskList}
              />
              <CommentsSection parentId={taskList.id} type="tasklist" />
            </>
          ))}
        </ul>

        {archivedTaskLists.length > 0 && (
          <div className="mt-12 flex w-full flex-grow items-center border-t border-muted py-4">
            <p className="text-sm text-muted-foreground">
              {archivedTaskLists.length} archived task list(s)
            </p>

            {filterByStatuses.includes("archived") ? (
              <Link
                href={`/console/projects/${projectId}/tasklists`}
                className={buttonVariants({ variant: "link" })}
              >
                Hide
              </Link>
            ) : (
              <Link
                href={`/console/projects/${projectId}/tasklists?status=active,archived`}
                className={buttonVariants({ variant: "link" })}
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
