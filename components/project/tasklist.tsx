"use client";

import { archiveTaskList, createTask } from "@/app/console/projects/[projectId]/tasklists/actions";
import { TaskListWithTasks, TaskWithDetails } from "@/drizzle/types";
import { useMemo } from "react";
import InlineTaskForm from "../form/task";
import { TaskItem } from "./task-item";
import { TaskListHeader } from "./tasklist-header";
import { MarkdownView } from "../core/markdown-view";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { toast } from "react-hot-toast";

export const TaskListItem = ({
  taskList,
  userId,
  projectId,
}: {
  taskList: TaskListWithTasks;
  userId: string;
  projectId: number;
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
    <div
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
    >
      <TaskListHeader taskList={taskList}
        totalCount={taskList.tasks.length}
        doneCount={doneItems.length}
      />
      {taskList.description ? (
        <div className="py-2 px-6 border-b border-gray-900/5">
          <MarkdownView content={taskList.description ?? ""} />
        </div>
      ) : null}
      <div className="flex flex-col justify-center divide-y">
        {todoItems.map((task) => (
          <TaskItem key={task.id} task={task} projectId={Number(projectId)} />
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
          <TaskItem key={task.id} task={task} projectId={Number(projectId)} />
        ))}
      </div>

      <div className="flex h-12 flex-col justify-center mt-2 border-t border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 lg:-mx-4">
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
                <Button
                  variant="ghost"
                  onClick={async () => {
                    toast.promise(
                      archiveTaskList(
                        taskList.id,
                        projectId,
                      ),
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
              </span>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
