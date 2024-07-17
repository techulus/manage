"use client";

import { TaskListWithTasks, User } from "@/drizzle/types";
import { useMemo } from "react";
import { MarkdownView } from "../../core/markdown-view";
import InlineTaskForm from "../../form/task";
import { TaskItem } from "./task/task-item";
import { TaskListHeader } from "./tasklist-header";

export const TaskListItem = ({
  taskList,
  userId,
  projectId,
  users,
  createTask,
  partialUpdateTaskList,
  hideHeader = false,
  hideDone = false,
}: {
  taskList: TaskListWithTasks;
  userId: string;
  projectId: number;
  users: User[];
  createTask: any;
  partialUpdateTaskList: (
    id: number,
    data: { status: string }
  ) => Promise<void>;
  hideHeader?: boolean;
  hideDone?: boolean;
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
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      {!hideHeader ? (
        <TaskListHeader
          taskList={taskList}
          totalCount={taskList.tasks.length}
          doneCount={doneItems.length}
          partialUpdateTaskList={partialUpdateTaskList}
        />
      ) : null}

      {taskList.description ? (
        <div className="border-b border-gray-900/5 px-6">
          <MarkdownView content={taskList.description ?? ""} />
        </div>
      ) : null}

      <div className="flex flex-col justify-center">
        {todoItems.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            projectId={+projectId}
            users={users}
          />
        ))}

        <form
          className="px-6 py-2"
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

        {!hideDone
          ? doneItems.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projectId={+projectId}
                users={users}
              />
            ))
          : null}
      </div>
    </div>
  );
};
