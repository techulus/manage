import { Document } from "@/drizzle/types";
import { DocumentIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export const DocumentHeader = ({ document }: { document: Document }) => {
  return (
    <div className="relative flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-900">
      <Link
        href={`/console/projects/${document.projectId}/documents/${document.id}`}
        className="text-sm font-medium flex"
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <DocumentIcon className="mr-2 h-6 w-6 text-muted-foreground" />
        <div className="text-xl font-medium leading-6">{document.name}</div>
      </Link>
    </div>
  );
};
