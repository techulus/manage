import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { DocumentHeader } from "@/components/project/document/document-header";
import { FileInfo } from "@/components/project/file/info";
import { FileUploader } from "@/components/project/file/uploader";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { documentFolder } from "@/drizzle/schema";
import { FolderWithContents } from "@/drizzle/types";
import { eq } from "drizzle-orm";
import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import { reloadDocuments } from "../../actions";

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
            creator: {
              columns: {
                firstName: true,
                imageUrl: true,
              },
            },
          },
        },
        files: {
          with: {
            creator: {
              columns: {
                firstName: true,
                imageUrl: true,
              },
            },
          },
        },
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

      <div className="mx-auto max-w-5xl space-y-16 px-4 lg:px-0">
        {folder.description ? (
          <div className="flex flex-col">
            <MarkdownView content={folder.description ?? ""} />
          </div>
        ) : null}

        <div className="flex h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:-mx-4 lg:px-8">
            <div className="flex justify-between py-3">
              {/* Left buttons */}
              <div className="isolate inline-flex sm:space-x-3">
                <span className="inline-flex space-x-1">
                  <FileUploader
                    folderId={Number(folderId)}
                    projectId={+projectId}
                    reloadDocuments={reloadDocuments}
                  />
                </span>
              </div>

              {/* Right buttons */}
              <nav aria-label="Pagination">
                <span className="isolate inline-flex">
                  <Link
                    href={`/console/projects/${projectId}/documents/folders/${folderId}/new`}
                    className={buttonVariants({ variant: "link" })}
                  >
                    <FilePlus2 className="mr-1 h-5 w-5" /> Document
                    <span className="sr-only">, document</span>
                  </Link>
                </span>
              </nav>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {folder.documents.length || folder.files.length ? (
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
                ? folder.files.map((file) => (
                    <div
                      key={file.key}
                      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                    >
                      <FileInfo file={file} />
                    </div>
                  ))
                : null}
            </ul>
          ) : null}

          <EmptyState
            show={!folder.documents.length && !folder.files.length}
            label="document"
            createLink={`/console/projects/${projectId}/documents/new`}
          />
        </div>
      </div>
    </>
  );
}
