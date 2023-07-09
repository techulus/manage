import { Document } from "@/drizzle/types";
import Link from "next/link";

export const DocumentHeader = ({ document }: { document: Document }) => {
  return (
    <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 dark:bg-gray-900 p-6">
      <Link
        href={`/console/projects/${document.projectId}/documents`}
        className="text-sm font-medium"
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="font-medium text-xl leading-6">{document.name}</div>
      </Link>
    </div>
  );
};
