import { DocumentWithCreator } from "@/drizzle/types";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import Link from "next/link";
import { CreatorDetails } from "../shared/creator-details";

const MAX_LENGTH = 140;

export async function DocumentHeader({
  document,
}: {
  document: DocumentWithCreator;
}) {
  const plainText = await convertMarkdownToPlainText(document.markdownContent);

  return (
    <div className="relative flex h-[180px] gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-900">
      <Link
        href={`/console/projects/${document.projectId}/documents/${document.id}`}
        className="flex flex-col text-sm font-medium"
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="flex-shrink space-y-2">
          <div className="text-xl font-medium leading-6">{document.name}</div>
          <p>
            <span className="sr-only">, </span>
            <span className="text-sm text-muted-foreground">
              {plainText.length > MAX_LENGTH
                ? plainText.substring(0, MAX_LENGTH) + "..."
                : plainText}
            </span>
          </p>
        </div>

        <CreatorDetails
          user={document.creator}
          updatedAt={document.updatedAt}
        />
      </Link>
    </div>
  );
}
