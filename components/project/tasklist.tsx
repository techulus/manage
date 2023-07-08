"use client";

import { createTask } from "@/app/console/projects/[projectId]/tasklists/actions";
import { TaskListWithTasks } from "@/drizzle/types";
import { useMemo } from "react";
import InlineTaskForm from "../form/task";
import { TaskItem } from "./task-item";
import { TaskListHeader } from "./tasklist-header";
import { MarkdownView } from "../core/markdown-view";

export const TaskListItem = ({
  taskList,
  userId,
  projectId,
}: {
  taskList: TaskListWithTasks;
  userId: string;
  projectId: number;
}) => {
  const todoItems = useMemo(
    () => taskList.tasks.filter((task) => task.status === "todo"),
    [taskList.tasks]
  );
  const doneItems = useMemo(
    () => taskList.tasks.filter((task) => task.status === "done"),
    [taskList.tasks]
  );

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
    >
      <TaskListHeader taskList={taskList}
        totalCount={taskList.tasks.length}
        doneCount={doneItems.length}
      />
      {taskList.description ? (
        <div className="py-2 px-6 border-b border-gray-900/5">
          <MarkdownView content={taskList.description ?? ""} />
        </div>
      ) : null}
      <div className="py-4 px-6">
        <div className="flex flex-col justify-center divide-y">
          {todoItems.map((task) => (
            <TaskItem key={task.id} task={task} projectId={Number(projectId)} />
          ))}

          <form
            className="py-4"
            action={async (formData: FormData) => {
              const name = formData.get("name") as string;

              await createTask({
                name,
                userId,
                taskListId: taskList.id,
                projectId,
              });
            }}
          >
            <InlineTaskForm />
          </form>

          {doneItems.map((task) => (
            <TaskItem key={task.id} task={task} projectId={Number(projectId)} />
          ))}
        </div>
      </div>
    </div>
  );
};
