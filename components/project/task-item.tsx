"use client";

import { updateTask } from "@/app/console/projects/[projectId]/tasklists/actions";
import { Task } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";

import { cn } from "@/lib/utils";
import { experimental_useOptimistic as useOptimistic } from "react";

export const TaskItem = ({
  task,
  projectId,
}: {
  task: Task;
  projectId: number;
}) => {
  const [optimisticTask, updateOptimisticTask] = useOptimistic(
    task,
    (task: Task, status: string) => ({ ...task, status })
  );

  const { id, name, status } = optimisticTask;

  return (
    <div key={id} className="flex items-center space-x-2">
      <Checkbox
        id={`task-${id}`}
        checked={status === "done"}
        className={cn(status === "done" ? "opacity-50" : "")}
        onCheckedChange={async (checked) => {
          const status = checked ? "done" : "todo";
          updateOptimisticTask(status);
          await updateTask({
            id,
            status,
            projectId,
          });
        }}
      />
      <label
        htmlFor={`task-${id}`}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          status === "done" ? "line-through" : ""
        )}
      >
        {name}
      </label>
    </div>
  );
};
