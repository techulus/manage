"use client";

import {
  deleteTask,
  updateTask,
} from "@/app/console/projects/[projectId]/tasklists/actions";
import { Task, TaskWithDetails } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { experimental_useOptimistic as useOptimistic, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Checkbox } from "../../../ui/checkbox";
import TaskNotesForm from "./notes-form";
import { Input } from "@/components/ui/input";

export const TaskItem = ({
  task,
  projectId,
}: {
  task: TaskWithDetails;
  projectId: number;
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [optimisticTask, updateOptimisticTask] = useOptimistic(
    task,
    (task: Task, data: { status: string } | { name: string }) => ({
      ...task,
      ...data,
    })
  );

  const { id, name, status } = optimisticTask;

  if (detailsOpen) {
    return (
      <Card className="flex w-full flex-col rounded-none bg-gray-50 dark:bg-gray-900">
        <CardHeader className="pt-0">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={status === "done"}
              className={cn(status === "done" ? "opacity-50" : "", "mr-1 my-4")}
              onCheckedChange={async (checked) => {
                const status = checked ? "done" : "todo";
                updateOptimisticTask({ status });

                toast.promise(updateTask(id, projectId, { status }), {
                  loading: "Saving...",
                  success: "Updated!",
                  error: "Error while saving, please try again.",
                });
              }}
              disabled={isEditing}
            />
            {isEditing ? (
              <Input
                type="text"
                value={name}
                onChange={(e) => updateOptimisticTask({ name: e.target.value })}
                className="text-md w-full text-left font-medium leading-none"
              />
            ) : (
              <button
                onClick={() => setDetailsOpen(false)}
                className={cn(
                  "text-md w-full text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 py-4",
                  status === "done" ? "text-muted-foreground line-through" : ""
                )}
              >
                {name}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="border-t border-gray-100 text-primary dark:border-gray-800">
            <dl>
              <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6">Created By</dt>
                <dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
                  <span className="flex-grow">{task.creator?.firstName}</span>
                  <button
                    className="mr-4 text-teal-600"
                    onClick={async () => {
                      setIsEditing((val) => !val);

                      if (!isEditing) return;

                      await toast.promise(updateTask(id, projectId, { name }), {
                        loading: "Saving...",
                        success: "Done!",
                        error: "Error while saving, please try again.",
                      });
                    }}
                  >
                    {isEditing ? "Save" : "Edit"}
                  </button>
                  <button
                    className="text-teal-600 hover:text-red-500"
                    onClick={() => {
                      toast.promise(
                        deleteTask({
                          id,
                          projectId,
                        }),
                        {
                          loading: "Deleting...",
                          success: "Deleted!",
                          error: "Error while deleting, please try again.",
                        }
                      );
                    }}
                  >
                    Delete
                  </button>
                </dd>
              </div>
            </dl>
            <dl>
              <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6">Assigned to</dt>
                <dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
                  {task.assignee ? (
                    <span className="flex-grow">
                      {task.assignee?.firstName}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="rounded-md font-medium text-teal-600 hover:text-teal-500"
                    >
                      Assign
                    </button>
                  )}
                </dd>
              </div>
            </dl>
            <dl>
              <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6">Notes</dt>
                <dd className="mt-1 flex items-start text-sm leading-6 sm:col-span-2 sm:mt-0">
                  <TaskNotesForm task={task} />
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={status === "done"}
        className={cn(status === "done" ? "opacity-50" : "", "ml-6 mr-1 my-4")}
        onCheckedChange={async (checked) => {
          const status = checked ? "done" : "todo";
          updateOptimisticTask({ status });

          toast.promise(updateTask(id, projectId, { status }), {
            loading: "Saving...",
            success: "Done!",
            error: "Error while saving, please try again.",
          });
        }}
      />
      <button
        className={cn(
          "text-md w-full py-4 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          status === "done" ? "text-muted-foreground line-through" : ""
        )}
        onClick={() => setDetailsOpen(true)}
      >
        {name}
      </button>
    </div>
  );
};
