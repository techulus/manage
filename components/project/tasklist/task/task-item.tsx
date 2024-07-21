"use client";

import {
  deleteTask,
  updateTask,
} from "@/app/(dashboard)/console/projects/[projectId]/tasklists/actions";
import { Task, TaskWithDetails, User } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AlignJustifyIcon, FileIcon } from "lucide-react";
import { useReducer, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Checkbox } from "../../../ui/checkbox";
import { Assignee } from "../../shared/assigee";
import { AssignToUser } from "../../shared/assign-to-user";
import TaskNotesForm from "./notes-form";
import { DateTimePicker } from "../../events/date-time-picker";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { id, name, status } = optimisticTask;

  const updateTaskToastOptions = {
    loading: "Saving...",
    success: "Done!",
    error: "Error while saving, please try again.",
  };

  return (
    <Card
      className={cn(
        "flex scale-100 rounded-lg border-none shadow-none dark:bg-black",
        detailsOpen
          ? "scale-[1.02] flex-col border-gray-200 bg-gray-50 shadow-md"
          : "flex-row items-center justify-center space-x-2 border-none"
      )}
      ref={setNodeRef}
      style={style}
    >
      {detailsOpen ? (
        <>
          <CardHeader className="py-0">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={status === "done"}
                className={cn(
                  status === "done" ? "opacity-50" : "",
                  "my-4 mr-1"
                )}
                onCheckedChange={async (checked) => {
                  const status = checked ? "done" : "todo";
                  updateOptimisticTask({ status });

                  toast.promise(
                    updateTask(id, projectId, { status }),
                    updateTaskToastOptions
                  );
                }}
                disabled={isEditing}
              />

              {isEditing ? (
                <Input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    updateOptimisticTask({ name: e.target.value })
                  }
                  className="text-md w-full text-left font-medium leading-none"
                />
              ) : (
                <button
                  onClick={() => setDetailsOpen(false)}
                  className={cn(
                    "text-md w-full py-1 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    status === "done"
                      ? "text-muted-foreground line-through"
                      : ""
                  )}
                >
                  {name}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-primary">
              <dl>
                <div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6">Created By</dt>
                  <dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
                    <span className="flex-grow">{task.creator?.firstName}</span>
                    <button
                      className="mr-4 text-teal-600"
                      onClick={async () => {
                        setIsEditing((val) => !val);

                        if (!isEditing) return;

                        await toast.promise(
                          updateTask(id, projectId, { name }),
                          updateTaskToastOptions
                        );
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
                <div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
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
                              updateTask(id, projectId, {
                                assignedToUser: null,
                              }),
                              updateTaskToastOptions
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
                            updateTask(id, projectId, {
                              assignedToUser: userId,
                            }),
                            updateTaskToastOptions
                          );
                        }}
                      />
                    )}
                  </dd>
                </div>
              </dl>
              <dl>
                <div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6">Due</dt>
                  <dd className="mt-1 flex items-start text-sm leading-6 sm:col-span-2 sm:mt-0">
                    {task.dueDate ? (
                      <div className="flex w-full items-center justify-between">
                        <p>{task.dueDate.toLocaleDateString()}</p>
                        <button
                          className="text-teal-600 hover:text-red-500"
                          onClick={() => {
                            toast.promise(
                              updateTask(id, projectId, {
                                dueDate: null,
                              }),
                              updateTaskToastOptions
                            );
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <DateTimePicker
                        dateOnly
                        name="dueDate"
                        onSelect={(date) => {
                          toast.promise(
                            updateTask(id, projectId, {
                              dueDate: date,
                            }),
                            updateTaskToastOptions
                          );
                        }}
                      />
                    )}
                  </dd>
                </div>
              </dl>
              <dl>
                <div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6">Notes</dt>
                  <dd className="mt-1 flex items-start text-sm leading-6 sm:col-span-2 sm:mt-0">
                    <TaskNotesForm task={task} />
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <Checkbox
            checked={status === "done"}
            className={cn(
              "my-4 ml-6 mr-1 transition-all",
              status === "done" ? "my-2.5 opacity-50" : ""
            )}
            onCheckedChange={async (checked) => {
              const status = checked ? "done" : "todo";
              updateOptimisticTask({ status });

              toast.promise(
                updateTask(id, projectId, { status }),
                updateTaskToastOptions
              );
            }}
          />
          <button
            className={cn(
              "text-md w-full py-1 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              status === "done" ? "text-muted-foreground line-through" : ""
            )}
            onClick={() => setDetailsOpen(true)}
          >
            <div
              className={cn(
                "flex w-full items-center py-2",
                task.status != "done" ? "border-b" : ""
              )}
            >
              {task.assignee ? (
                <Assignee className="mr-2" user={task.assignee} imageOnly />
              ) : null}
              {name}
              {task.description ? (
                <FileIcon className="ml-2 h-4 w-4 text-teal-600 dark:text-teal-700" />
              ) : null}
            </div>
          </button>

          {task.status !== "done" ? (
            <div
              className="cursor-move p-2 pr-4"
              {...attributes}
              {...listeners}
            >
              <AlignJustifyIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
};
