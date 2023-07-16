import { ContentBlock } from "@/components/core/content-block";
import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { DocumentHeader } from "@/components/project/document/document-header";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { DocumentPlusIcon } from "@heroicons/react/20/solid";
import { eq } from "drizzle-orm";
import { documentFolder } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { Blob, FolderWithContents } from "@/drizzle/types";
import { FileUploader } from "@/components/project/file/uploader";

type Props = {
  params: {
    projectId: string;
    folderId?: string;
  };
};

export default async function FolderDetails({ params }: Props) {
  const { projectId, folderId } = params;

  const folder: FolderWithContents | undefined =
    await db.query.documentFolder.findFirst({
      where: eq(documentFolder.id, Number(folderId)),
      with: {
        documents: {
          with: {
            user: {
              columns: {
                firstName: true,
                imageUrl: true,
              },
            },
          },
        },
        files: true,
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
        backUrl={`/console/projects/${projectId}`}
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/documents/folders/${folderId}/edit`}
      />

      <div className="space-y-16">
        {folder.description ? (
          <div className="mx-auto flex max-w-5xl flex-col space-y-4">
            <MarkdownView content={folder.description ?? ""} />
          </div>
        ) : null}

        <ContentBlock>
          <div className="hidden h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800 md:flex">
            <div className="px-4 sm:px-6 lg:-mx-4 lg:px-8">
              <div className="flex justify-between py-3">
                {/* Left buttons */}
                <div className="isolate inline-flex sm:space-x-3">
                  <span className="inline-flex space-x-1">
                    <FileUploader folderId={Number(folderId)} />
                  </span>
                </div>

                {/* Right buttons */}
                <nav aria-label="Pagination">
                  <span className="isolate inline-flex">
                    <Link
                      href={`/console/projects/${projectId}/documents/folders/${folderId}/new`}
                      className={buttonVariants({ variant: "link" })}
                    >
                      <DocumentPlusIcon className="mr-1 h-5 w-5" /> File
                      <span className="sr-only">, document</span>
                    </Link>
                  </span>
                </nav>
              </div>
            </div>
          </div>
        </ContentBlock>

        <div className="mx-auto flex max-w-5xl flex-col space-y-4">
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
                  {/* @ts-ignore */}
                  <DocumentHeader document={document} />
                </div>
              ))}

              {folder.files.length
                ? folder.files.map((file: Blob) => (
                    <div
                      key={file.key}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {file.key}
                    </div>
                  ))
                : null}
            </ul>
          ) : null}

          <EmptyState
            show={!folder.documents.length}
            label="document"
            createLink={`/console/projects/${projectId}/documents/new`}
          />
        </div>
      </div>
    </>
  );
}
