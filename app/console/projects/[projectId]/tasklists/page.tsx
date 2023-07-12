import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { db } from "@/drizzle/db";
import { task, taskList } from "@/drizzle/schema";
import { getOwner } from "@/lib/utils/useOwner";
import { getProjectById } from "@/lib/utils/useProjects";
import { and, asc, eq } from "drizzle-orm";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function TaskLists({ params }: Props) {
  const { userId } = getOwner();
  const { projectId } = params;

  const project = await getProjectById(projectId);

  const taskLists = await db.query.taskList
    .findMany({
      where: and(
        eq(taskList.projectId, Number(projectId)),
        eq(taskList.status, "active")
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

  const archivedTaskLists = await db.query.taskList
    .findMany({
      columns: {
        id: true,
      },
      where: and(
        eq(taskList.projectId, Number(projectId)),
        eq(taskList.status, "archived")
      ),
    })
    .execute();

  return (
    <>
      <PageTitle
        title="Task lists"
        subTitle={project.name}
        backUrl={`/console/projects/${projectId}`}
        actionLabel="New list"
        actionLink={`/console/projects/${projectId}/tasklists/new`}
      />

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0">
        <ul role="list" className="mt-6 space-y-6">
          {taskLists.map((taskList) => (
            <TaskListItem
              key={taskList.id}
              taskList={taskList}
              projectId={Number(projectId)}
              userId={userId}
            />
          ))}
        </ul>

        {archivedTaskLists.length > 0 && (
          <p className="mt-12 border-t border-muted pt-4 text-sm text-muted-foreground">
            {archivedTaskLists.length} archived task list(s)
          </p>
        )}
      </div>
    </>
  );
}
