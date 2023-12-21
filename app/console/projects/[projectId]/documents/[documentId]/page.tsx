import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { db } from "@/drizzle/db";
import { document } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { deleteDocument } from "../actions";

type Props = {
  params: {
    projectId: string;
    documentId: string;
  };
};

export default async function DocumentDetails({ params }: Props) {
  const { projectId, documentId } = params;

  const documentDetails = await db.query.document.findFirst({
    where: eq(document.id, +documentId),
    with: {
      folder: true,
    },
  });

  if (!documentDetails) {
    return null;
  }

  return (
    <>
      <PageTitle
        title={documentDetails.name}
        subTitle={
          documentDetails.folder
            ? `Docs / ${documentDetails.folder?.name}`
            : "Docs"
        }
        backUrl={
          documentDetails.folderId
            ? `/console/projects/${projectId}/documents/folders/${documentDetails.folderId}`
            : `/console/projects/${projectId}`
        }
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/documents/${documentId}/edit`}
      />

      <div className="mx-auto max-w-5xl px-4 lg:px-0">
        <div className="flex h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:-mx-4 lg:px-8">
            <div className="flex justify-between py-3">
              {/* Left buttons */}
              <div className="isolate inline-flex sm:space-x-3">
                <span className="inline-flex space-x-1"></span>
              </div>

              {/* Right buttons */}
              <nav aria-label="Pagination">
                <span className="isolate inline-flex">
                  <form
                    action={async () => {
                      "use server";
                      await deleteDocument(
                        documentId,
                        projectId,
                        documentDetails?.folderId
                      );
                    }}
                  >
                    <DeleteButton />
                  </form>
                </span>
              </nav>
            </div>
          </div>
        </div>

        <div className="mx-auto my-12 max-w-2xl  lg:mx-0 lg:max-w-none">
          <ul role="list" className="mt-6 space-y-6">
            <MarkdownView content={documentDetails.markdownContent} />
          </ul>
        </div>
      </div>
    </>
  );
}
