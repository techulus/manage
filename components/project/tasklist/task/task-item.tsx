"use client";

import {
  deleteTask,
  updateTask,
} from "@/app/console/projects/[projectId]/tasklists/actions";
import { Task, TaskWithDetails, User } from "@/drizzle/types";
import { cn } from "@/lib/utils";
// @ts-ignore
import { Input } from "@/components/ui/input";
import { FileIcon } from "lucide-react";
import { useReducer, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Checkbox } from "../../../ui/checkbox";
import { Assignee } from "../../shared/assigee";
import { AssignToUser } from "../../shared/assign-to-user";
import TaskNotesForm from "./notes-form";

export const TaskItem = ({
  task,
  projectId,
  users,
}: {
  task: TaskWithDetails;
  projectId: number;
  users: User[];
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [optimisticTask, updateOptimisticTask] = useReducer(
    (task: Task, data: { status: string } | { name: string }) => ({
      ...task,
      ...data,
    }),
    task
  );

  const { id, name, status } = optimisticTask;

  if (detailsOpen) {
    return (
      <Card className="flex w-full flex-col rounded-none bg-gray-50 dark:bg-gray-900">
        <CardHeader className="pt-0">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={status === "done"}
              className={cn(
                status === "done" ? "opacity-50" : "",
                "my-4 mr-1 scale-125"
              )}
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
                  "text-md w-full py-4 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
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
                    <>
                      <span className="flex-grow">
                        <Assignee user={task.assignee} />
                      </span>
                      <button
                        className="text-teal-600 hover:text-red-500"
                        onClick={() => {
                          toast.promise(
                            updateTask(id, projectId, { assignedToUser: null }),
                            {
                              loading: "Saving...",
                              success: "Done!",
                              error: "Error while saving, please try again.",
                            }
                          );
                        }}
                      >
                        Unassign
                      </button>
                    </>
                  ) : (
                    <AssignToUser
                      users={users}
                      onUpdate={(userId) => {
                        toast.promise(
                          updateTask(id, projectId, { assignedToUser: userId }),
                          {
                            loading: "Saving...",
                            success: "Done!",
                            error: "Error while saving, please try again.",
                          }
                        );
                      }}
                    />
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
        className={cn(
          status === "done" ? "opacity-50" : "",
          "my-4 ml-6 mr-1 scale-125"
        )}
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
        <div className="flex items-center">
          {task.assignee ? (
            <Assignee className="mr-2" user={task.assignee} imageOnly />
          ) : null}
          {name}
          {task.description ? (
            <FileIcon className="ml-2 h-4 w-4 text-teal-600 dark:text-teal-700" />
          ) : null}
        </div>
      </button>
    </div>
  );
};
