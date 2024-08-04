import type { DocumentWithCreator } from "@/drizzle/types";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import Link from "next/link";
import { CreatorDetails } from "../shared/creator-details";

export async function DocumentHeader({
  document,
}: {
  document: DocumentWithCreator;
}) {
  const plainText = convertMarkdownToPlainText(document.markdownContent);

  return (
    <div className="relative flex h-[240px] gap-x-4 overflow-hidden border-b border-gray-900/5 bg-white p-3 dark:bg-black">
      <Link
        href={`/console/projects/${document.projectId}/documents/${document.id}`}
        className="flex flex-col text-sm font-medium"
        prefetch={false}
      >
        <span
          className="absolute inset-0 top-2 z-10 bg-gradient-to-t from-gray-100 dark:from-black"
          aria-hidden="true"
        />
        <div className="flex-shrink space-y-2">
          <div className="text-xl font-medium leading-6">{document.name}</div>

          <CreatorDetails
            user={document.creator}
            updatedAt={document.updatedAt}
          />
        </div>

        <div className="absolute pr-4 pt-24">{plainText}</div>
      </Link>
    </div>
  );
}
