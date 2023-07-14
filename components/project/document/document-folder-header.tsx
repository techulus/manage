import { DocumentFolder } from "@/drizzle/types";
import { FolderIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export const DocumentFolderHeader = ({
  documentFolder,
}: {
  documentFolder: DocumentFolder;
}) => {
  return (
    <div className="relative flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-900">
      <Link
        href={`/console/projects/${documentFolder.projectId}/documents/folders/${documentFolder.id}`}
        className="flex text-sm font-medium"
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <FolderIcon
          className="mr-2 h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="text-xl font-medium leading-6">
          {documentFolder.name}
        </div>
      </Link>
    </div>
  );
};
