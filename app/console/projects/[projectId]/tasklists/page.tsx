import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist";
import { db } from "@/drizzle/db";
import { task, taskList } from "@/drizzle/schema";
import { getOwner } from "@/lib/utils/useOwner";
import { getProjectById } from "@/lib/utils/useProjects";
import { desc, eq } from "drizzle-orm";

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
      where: eq(taskList.projectId, Number(projectId)),
      with: {
        tasks: {
          orderBy: [desc(task.position)],
          with: {
            creator: {
              columns: {
                firstName: true,
                imageUrl: true,
              }
            },
            assignee: {
              columns: {
                firstName: true,
                imageUrl: true,
              }
            },
          }
        },
      },
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

      <div className="mx-auto max-w-5xl px-4 lg:px-0 my-12">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
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
        </div>
      </div>
    </>
  );
}
