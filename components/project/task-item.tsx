"use client";

import {
  deleteTask,
  updateTask,
} from "@/app/console/projects/[projectId]/tasklists/actions";
import { Checkbox } from "../ui/checkbox";

import { Task } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { experimental_useOptimistic as useOptimistic } from "react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
    <div key={id} className="flex items-center space-x-2 py-4">
      <Checkbox
        checked={status === "done"}
        className={cn(status === "done" ? "opacity-50" : "")}
        onCheckedChange={async (checked) => {
          const status = checked ? "done" : "todo";
          updateOptimisticTask(status);

          toast.promise(
            updateTask({
              id,
              status,
              projectId,
            }),
            {
              loading: "Saving...",
              success: "Done!",
              error: "Error while saving, please try again.",
            }
          );
        }}
      />
      <label
        className={cn(
          "text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          status === "done" ? "line-through text-muted-foreground" : ""
        )}
      >
        {name}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisHorizontalIcon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Assign</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              toast.promise(
                deleteTask({
                  id,
                  projectId,
                }),
                {
                  loading: "Deleting...",
                  success: "Done!",
                  error: "Error while deleting, please try again.",
                }
              );
            }}
          >
            <span className="text-red-500">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
