import { ContentBlock } from "@/components/core/content-block";
import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { DocumentHeader } from "@/components/project/document/document-header";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { DocumentPlusIcon, FolderPlusIcon } from "@heroicons/react/20/solid";
import { eq } from "drizzle-orm";
import { documentFolder } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { FolderWithDocuments } from "@/drizzle/types";

type Props = {
  params: {
    projectId: string;
    folderId?: string;
  };
};

export default async function FolderDetails({ params }: Props) {
  const { projectId, folderId } = params;

  const folder: FolderWithDocuments | undefined =
    await db.query.documentFolder.findFirst({
      where: eq(documentFolder.id, Number(folderId)),
      with: {
        documents: true,
      },
    });

  if (!folder) {
    return null;
  }

  return (
    <>
      <PageTitle
        title={folder?.name}
        subTitle="Documents"
        backUrl="/console/projects"
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/edit`}
      />

      {folder.description ? (
        <ContentBlock className="border-none shadow-none">
          <div className="p-6">
            <MarkdownView content={folder.description ?? ""} />
          </div>
        </ContentBlock>
      ) : null}

      <ContentBlock>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-7">Documents</h2>

            <div>
              <Link
                href={`/console/projects/${projectId}/documents/folders/${folderId}/new`}
                className={buttonVariants({ variant: "link" })}
              >
                Create <DocumentPlusIcon className="ml-1 h-5 w-5" />
                <span className="sr-only">, document</span>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {folder.documents.length ? (
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
            >
              {folder.documents.map((document) => (
                <div
                  key={document.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <DocumentHeader document={document} />
                </div>
              ))}
            </ul>
          ) : null}

          <EmptyState
            show={!folder.documents.length}
            label="document"
            createLink={`/console/projects/${projectId}/documents/new`}
          />
        </CardContent>
      </ContentBlock>
    </>
  );
}
