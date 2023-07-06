import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist";
import {
  TaskListHeader,
  TaskListWithCount,
} from "@/components/project/tasklist-header";
import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";

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
  const tasks = await prisma.task.findMany({
    where: {
      taskListId: Number(taskListId),
    },
  });

  if (!taskListId) {
    return <div>Tasklist not found</div>;
  }

  return (
    <TaskListItem
      taskListId={taskListId}
      tasks={tasks}
      projectId={projectId}
      userId={userId}
    />
  );
}

export default async function TaskLists({ params }: Props) {
  const { ownerId } = getOwner();
  const { projectId } = params;

  const project = await prisma.project.findFirst({
    where: {
      id: Number(projectId),
      organizationId: ownerId,
    },
  });

  const taskLists = await prisma.taskList.findMany({
    where: {
      projectId: Number(projectId),
      project: {
        organizationId: ownerId,
      },
    },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <PageTitle
        title={`${project.name} / Tasklists`}
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
                <TaskListHeader taskList={taskList as TaskListWithCount} />
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
