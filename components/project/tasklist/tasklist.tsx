"use client";

import { TaskListWithTasks, User } from "@/drizzle/types";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { MarkdownView } from "../../core/markdown-view";
import InlineTaskForm from "../../form/task";
import { Button, buttonVariants } from "../../ui/button";
import { TaskItem } from "./task/task-item";
import { TaskListHeader } from "./tasklist-header";

export const TaskListItem = ({
  taskList,
  userId,
  projectId,
  users,
  createTask,
  partialUpdateTaskList,
}: {
  taskList: TaskListWithTasks;
  userId: string;
  projectId: number;
  users: User[];
  createTask: any;
  partialUpdateTaskList: any;
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
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <TaskListHeader
        taskList={taskList}
        totalCount={taskList.tasks.length}
        doneCount={doneItems.length}
      />
      {taskList.description ? (
        <div className="border-b border-gray-900/5 px-6 py-2">
          <MarkdownView content={taskList.description ?? ""} />
        </div>
      ) : null}
      <div className="flex flex-col justify-center divide-y">
        {todoItems.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            projectId={+projectId}
            users={users}
          />
        ))}

        <form
          className="px-6 py-4"
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
          <TaskItem
            key={task.id}
            task={task}
            projectId={+projectId}
            users={users}
          />
        ))}
      </div>

      <div className="mt-2 flex h-12 flex-col justify-center border-t border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:-mx-4 lg:px-8">
          <div className="flex justify-between py-3">
            <div className="isolate inline-flex sm:space-x-3">
              <span className="inline-flex space-x-1">
                <Link
                  href={`/console/projects/${taskList.projectId}/tasklists/${taskList.id}/edit`}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Edit
                </Link>
              </span>
            </div>

            <nav aria-label="Pagination">
              <span className="isolate inline-flex">
                {taskList.status === "active" ? (
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      toast.promise(
                        partialUpdateTaskList(taskList.id, {
                          status: "archived",
                        }),
                        {
                          loading: "Archiving task list...",
                          success: "Task list archived.",
                          error: "Failed to archive task list.",
                        }
                      );
                    }}
                  >
                    Archive
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      toast.promise(
                        partialUpdateTaskList(taskList.id, {
                          status: "active",
                        }),
                        {
                          loading: "Unarchiving task list...",
                          success: "Task list activated.",
                          error: "Failed to activate task list.",
                        }
                      );
                    }}
                  >
                    Unarchive
                  </Button>
                )}
              </span>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
