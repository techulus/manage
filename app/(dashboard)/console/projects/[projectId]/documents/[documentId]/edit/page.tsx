import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import DocumentForm from "@/components/form/document";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getDocumentById } from "@/lib/utils/useProjects";
import Link from "next/link";
import { updateDocument } from "../../actions";

type Props = {
  params: {
    projectId: string;
    documentId: string;
  };
};

export default async function EditTaskList({ params }: Props) {
  const document = await getDocumentById(params.documentId);
  const backUrl = `/console/projects/${params.projectId}`;
  return (
    <>
      <PageTitle title="Update Document" backUrl={backUrl} />
      <form action={updateDocument}>
        <input type="hidden" name="id" defaultValue={params.documentId} />
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        {document.folderId && (
          <input
            type="hidden"
            name="folderId"
            defaultValue={document.folderId}
          />
        )}
        <ContentBlock>
          <CardContent>
            <DocumentForm item={document} />
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center justify-end gap-x-6">
              <Link
                href={backUrl}
                className={buttonVariants({ variant: "ghost" })}
              >
                Cancel
              </Link>
              <SaveButton />
            </div>
          </CardFooter>
        </ContentBlock>
      </form>
    </>
  );
}
