"use client";

import { Task } from "@prisma/client";

import { createTask } from "@/app/console/projects/[projectId]/tasklists/actions";
import { useMemo, experimental_useOptimistic as useOptimistic } from "react";
import InlineTaskForm from "../form/task";
import { TaskItem } from "./task-item";

export const TaskListItem = ({
  tasks,
  taskListId,
  projectId,
}: {
  tasks: Task[];
  taskListId: number;
  projectId: number;
}) => {
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (tasks: Task[], action: { type: "insert" | "update"; task: Task }) => {
      if (action.type === "insert") {
        return [...tasks, action.task];
      } else {
        return tasks.map((task) =>
          task.id === action.task.id ? action.task : task
        );
      }
    }
  );

  const todoItems = useMemo(
    () => optimisticTasks.filter((task) => task.status === "todo"),
    [optimisticTasks]
  );
  const doneItems = useMemo(
    () => optimisticTasks.filter((task) => task.status === "done"),
    [optimisticTasks]
  );

  return (
    <div className="p-4">
      <div className="space-y-2">
        {todoItems.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            projectId={Number(projectId)}
            updateOptimisticTasks={updateOptimisticTasks}
          />
        ))}

        <form
          action={async (formData: FormData) => {
            const name = formData.get("name") as string;

            updateOptimisticTasks({
              type: "insert",
              task: {
                id: 99,
                name,
                status: "todo",
                deadline: null,
                description: null,
                taskListId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            await createTask({
              name,
              taskListId,
              projectId,
            });
          }}
        >
          <InlineTaskForm />
        </form>

        {doneItems.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            projectId={Number(projectId)}
            updateOptimisticTasks={updateOptimisticTasks}
          />
        ))}
      </div>
    </div>
  );
};
