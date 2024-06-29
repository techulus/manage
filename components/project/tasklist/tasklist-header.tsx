"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskList } from "@/drizzle/types";
import { CircleEllipsisIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export const TaskListHeader = ({
  taskList,
  totalCount,
  doneCount,
  partialUpdateTaskList,
}: {
  taskList: TaskList;
  totalCount?: number;
  doneCount?: number;
  partialUpdateTaskList?: (
    id: number,
    data: { status: string }
  ) => Promise<void>;
}) => {
  const completedPercent =
    totalCount != null && doneCount != null ? doneCount / totalCount : null;

  return (
    <div className="group relative flex items-center gap-x-4 border-b border-gray-900/5 bg-white p-3 pt-4 dark:bg-black">
      {completedPercent != null ? (
        <div
          className="absolute left-0 top-0 z-0 h-2 w-full rounded-lg bg-green-200 opacity-70 transition-all dark:bg-green-900"
          style={{ width: `${completedPercent * 100}%` }}
        />
      ) : null}
      <Link
        href={`/console/projects/${taskList.projectId}/tasklists/${taskList.id}`}
        className="text-sm font-medium"
        prefetch={false}
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="mb-2 flex">
          <div className="text-xl font-bold leading-6 tracking-tight">
            {taskList.name}
            {taskList.status === "archived" ? " (Archived)" : null}
          </div>
        </div>

        {totalCount != null && doneCount != null ? (
          <Badge variant="outline">
            {doneCount}/{totalCount} completed
          </Badge>
        ) : null}
        {taskList.dueDate ? (
          <Badge variant="outline" className="ml-2" suppressHydrationWarning>
            Due {taskList.dueDate.toLocaleDateString()}
          </Badge>
        ) : null}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="absolute right-3 top-3">
          <CircleEllipsisIcon className="h-6 w-6" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="w-full p-0">
            <Link
              href={`/console/projects/${taskList.projectId}/tasklists/${taskList.id}/edit`}
              className={buttonVariants({
                variant: "ghost",
                className: "w-full",
              })}
              prefetch={false}
            >
              Edit
            </Link>
          </DropdownMenuItem>
          {partialUpdateTaskList ? (
            <DropdownMenuItem className="w-full p-0">
              <Button
                variant="ghost"
                className="w-full"
                onClick={async () => {
                  toast.promise(
                    partialUpdateTaskList(taskList.id, {
                      status:
                        taskList.status === "active" ? "archived" : "active",
                    }),
                    {
                      loading: "Updating task list...",
                      success: "Task list updated.",
                      error: "Failed to update task list.",
                    }
                  );
                }}
              >
                {taskList.status === "active" ? "Archive" : "Unarchive"}
              </Button>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
