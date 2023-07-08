import { TaskList } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export const TaskListHeader = ({ taskList, totalCount, doneCount }: {
  taskList: TaskList,
  totalCount?: number,
  doneCount?: number
}) => {
  const completedPercent = totalCount != null && doneCount != null ? doneCount / totalCount : null;

  return (
    <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 dark:bg-gray-900 p-6 relative">
      {
        completedPercent != null ?
          <div className="transition-all rounded-md absolute top-0 left-0 h-full w-full bg-green-200 dark:bg-green-900 opacity-20 z-0"
            style={{ width: `${completedPercent * 100}%` }} />
          : null
      }
      <Link
        href={`/console/projects/${taskList.projectId}/tasklists`}
        className="text-sm font-medium"
      >
        <div className="font-medium text-xl leading-6">{taskList.name}</div>
        {
          totalCount != null && doneCount != null ?
            <div className="mt-1 text-sm text-muted-foreground">{doneCount}/{totalCount} completed</div>
            : null
        }
      </Link>

      <div className="flex-1 flex justify-end">
        <Link
          href={`/console/projects/${taskList.projectId}/tasklists/${taskList.id}/edit`}
          className="text-sm font-medium"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};
