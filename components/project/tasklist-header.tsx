import { TaskList } from "@/drizzle/types";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export const TaskListHeader = ({ taskList }: { taskList: TaskList }) => {
  return (
    <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 dark:bg-gray-900 p-6">
      <Link
        href={`/console/projects/${taskList.projectId}/tasklists`}
        className="text-sm font-medium"
      >
        <div className="font-medium text-xl leading-6">{taskList.name}</div>
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
