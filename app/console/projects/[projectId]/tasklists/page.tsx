import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist";
import { TaskListHeader } from "@/components/project/tasklist-header";
import { db } from "@/drizzle/db";
import { task, taskList } from "@/drizzle/schema";
import { getOwner } from "@/lib/utils/useOwner";
import { getProjectById } from "@/lib/utils/useProjects";
import { eq } from "drizzle-orm";

type Props = {
  params: {
    projectId: string;
  };
};

async function TaskListDetails({
  projectId,
  taskListId,
}: {
  projectId: number;
  taskListId: number;
}) {
  const { userId } = getOwner();
  const allTasks = await db
    .select()
    .from(task)
    .where(eq(task.taskListId, Number(taskListId)))
    .all();

  if (!taskListId) {
    return <div>Tasklist not found</div>;
  }

  return (
    <TaskListItem
      taskListId={taskListId}
      tasks={allTasks}
      projectId={projectId}
      userId={userId}
    />
  );
}

export default async function TaskLists({ params }: Props) {
  const { projectId } = params;

  const project = await getProjectById(projectId);

  const taskLists = await db
    .select()
    .from(taskList)
    .where(eq(taskList.projectId, Number(projectId)))
    .all();

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
              <div
                key={taskList.id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <TaskListHeader taskList={taskList} />
                {taskList.description ? (
                  <div className="p-6 border-b border-gray-900/5">
                    <MarkdownView content={taskList.description ?? ""} />
                  </div>
                ) : null}
                {/* @ts-ignore React server component */}
                <TaskListDetails
                  projectId={Number(projectId)}
                  taskListId={taskList.id}
                />
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
