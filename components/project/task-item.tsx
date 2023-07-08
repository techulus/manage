"use client";

import {
  deleteTask,
  updateTask,
} from "@/app/console/projects/[projectId]/tasklists/actions";
import { Checkbox } from "../ui/checkbox";
import { Task, TaskWithDetails } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { EllipsisHorizontalIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { experimental_useOptimistic as useOptimistic, useState } from "react";
import toast from "react-hot-toast";
import { ContentBlock } from "../core/content-block";
import { Button } from "../ui/button";

export const TaskItem = ({
  task,
  projectId,
}: {
  task: TaskWithDetails;
  projectId: number;
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [optimisticTask, updateOptimisticTask] = useOptimistic(
    task,
    (task: Task, status: string) => ({ ...task, status })
  );

  const { id, name, status } = optimisticTask;

  if (detailsOpen) {
    return <ContentBlock className="flex flex-col w-full p-4 lg:mt-0 rounded-none">
      <div className="flex items-center space-x-2">
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

        <button
          className="ml-auto"
          onClick={() => setDetailsOpen(false)}
        >
          <XMarkIcon className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <div className="mt-6 border-t border-gray-100 dark:border-gray-800 text-primary">
        <dl>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6">Created By</dt>
            <dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
              <span className="flex-grow">{task.creator?.firstName}</span>
            </dd>
          </div>
        </dl>
        <dl>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6">Assigned to</dt>
            <dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
              <span className="flex-grow">{task.assignedToUser}</span>
            </dd>
          </div>
        </dl>
        <dl>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6">Notes</dt>
            <dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
              <span className="flex-grow">{task.description}</span>
            </dd>
          </div>
        </dl>

        <Button
          className="mt-4"
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
          variant="destructive">Delete</Button>
      </div>
    </ContentBlock>
  };

  return (
    <div className="flex items-center space-x-2 py-4">
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
      <button
        onClick={() => setDetailsOpen(true)}
      >
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
