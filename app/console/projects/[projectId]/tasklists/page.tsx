import InlineTaskForm from "@/components/form/task";
import PageTitle from "@/components/layout/page-title";
import { Checkbox } from "@/components/ui/checkbox";
import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import { createTask } from "./actions";

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
  const tasks = await prisma.task.findMany({
    where: {
      taskListId: Number(taskListId),
    },
  });

  if (!taskListId) {
    return <div>Project not found</div>;
  }

  return (
    <div className="p-4">
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-2">
            <Checkbox id={`task-${task.id}`} />
            <label
              htmlFor={`task-${task.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {task.name}
            </label>
          </div>
        ))}

        <form action={createTask}>
          <div className="flex items-center mt-4">
            <input type="hidden" name="taskListId" defaultValue={taskListId} />
            <input type="hidden" name="projectId" defaultValue={projectId} />
            <InlineTaskForm />
          </div>
        </form>
      </div>
    </div>
  );
}

export default async function ProjectDetails({ params }: Props) {
  const ownerId = getOwner();
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
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/edit`}
      />

      <div className="mx-auto max-w-5xl px-4 lg:px-0 my-12">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <ul role="list" className="mt-6 space-y-6">
            {taskLists.map((taskList) => (
              <div
                key={taskList.id}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                  <div className="text-sm font-medium leading-6 text-gray-900">
                    {taskList.name}
                  </div>
                </div>
                {/* @ts-ignore React server component */}
                <TaskListDetails
                  projectId={Number(projectId)}
                  taskListId={taskList.id}
                />
              </div>
            ))}

            <li className="overflow-hidden rounded-xl border border-gray-200">
              <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                <div className="text-sm font-medium leading-6 text-gray-900">
                  Create
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
