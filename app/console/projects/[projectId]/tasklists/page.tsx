import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist";
import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import { PencilSquareIcon } from "@heroicons/react/20/solid";

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

export default async function ProjectDetails({ params }: Props) {
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
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 dark:bg-gray-900 p-6">
                  <div className="font-medium text-xl leading-6">
                    {taskList.name}
                  </div>

                  <div className="flex-1 flex justify-end">
                    <a
                      href={`/console/projects/${projectId}/tasklists/${taskList.id}/edit`}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>
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
