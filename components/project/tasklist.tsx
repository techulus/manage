"use client";

import { createTask } from "@/app/console/projects/[projectId]/tasklists/actions";
import { Task } from "@/drizzle/types";
import { useMemo } from "react";
import InlineTaskForm from "../form/task";
import { TaskItem } from "./task-item";

export const TaskListItem = ({
  tasks,
  userId,
  taskListId,
  projectId,
}: {
  tasks: Task[];
  userId: string;
  taskListId: number;
  projectId: number;
}) => {
  const todoItems = useMemo(
    () => tasks.filter((task) => task.status === "todo"),
    [tasks]
  );
  const doneItems = useMemo(
    () => tasks.filter((task) => task.status === "done"),
    [tasks]
  );

  return (
    <div className="p-4">
      <div className="space-y-2">
        {todoItems.map((task) => (
          <TaskItem key={task.id} task={task} projectId={Number(projectId)} />
        ))}

        <form
          action={async (formData: FormData) => {
            const name = formData.get("name") as string;

            await createTask({
              name,
              userId,
              taskListId,
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
  );
};
