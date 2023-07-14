import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { db } from "@/drizzle/db";
import { document } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: {
    projectId: string;
    documentId: string;
  };
};

export default async function DocumentDetails({ params }: Props) {
  const { projectId, documentId } = params;

  const documentDetails = await db.query.document.findFirst({
    where: eq(document.id, Number(documentId)),
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
            : `/console/projects/${projectId}/documents`
        }
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/documents/${documentId}/edit`}
      />

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <ul role="list" className="mt-6 space-y-6">
            <MarkdownView content={documentDetails.markdownContent} />
          </ul>
        </div>
      </div>
    </>
  );
}
