import { DocumentFolderWithDocuments } from "@/drizzle/types";
import Link from "next/link";
import { CreatorDetails } from "../shared/creator-details";

export const DocumentFolderHeader = ({
  documentFolder,
}: {
  documentFolder: DocumentFolderWithDocuments;
}) => {
  return (
    <div className="relative flex h-[240px] gap-x-4 border-b border-gray-900/5 bg-white p-3 dark:bg-black">
      <Link
        href={`/console/projects/${documentFolder.projectId}/documents/folders/${documentFolder.id}`}
        className="flex flex-col text-sm font-medium"
        prefetch={false}
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="flex-shrink space-y-2">
          <div className="text-xl font-medium leading-6">
            {documentFolder.name}
          </div>

          <p>
            <span className="sr-only">, </span>
            <span className="text-sm text-muted-foreground">
              {documentFolder.documents.length + documentFolder.files.length}{" "}
              document(s)
            </span>
          </p>
        </div>

        <CreatorDetails
          user={documentFolder.creator}
          updatedAt={documentFolder.updatedAt}
        />
      </Link>
    </div>
  );
};
