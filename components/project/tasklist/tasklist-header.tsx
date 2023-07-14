import { TaskList } from "@/drizzle/types";
import Link from "next/link";

export const TaskListHeader = ({
  taskList,
  totalCount,
  doneCount,
}: {
  taskList: TaskList;
  totalCount?: number;
  doneCount?: number;
}) => {
  const completedPercent =
    totalCount != null && doneCount != null ? doneCount / totalCount : null;

  return (
    <div className="group relative flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 pt-8 dark:bg-gray-900">
      {completedPercent != null ? (
        <div
          className="absolute left-0 top-0 z-0 h-2 w-full rounded-md bg-green-200 opacity-70 transition-all dark:bg-green-900"
          style={{ width: `${completedPercent * 100}%` }}
        />
      ) : null}
      <Link
        href={`/console/projects/${taskList.projectId}/tasklists`}
        className="text-sm font-medium"
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="flex">
          <div className="text-xl font-medium leading-6">
            {taskList.name}
            {taskList.status === "archived" ? " (Archived)" : null}
          </div>
        </div>
        {totalCount != null && doneCount != null ? (
          <div className="mt-1 text-sm text-muted-foreground">
            {doneCount}/{totalCount} completed
          </div>
        ) : null}
      </Link>
    </div>
  );
};
