import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { prisma } from "@/lib/utils/db";
import DocumentForm from "@/components/form/document";
import { updateDocument } from "../../actions";

type Props = {
  params: {
    projectId: string;
    documentId: string;
  };
};

export default async function EditTaskList({ params }: Props) {
  const document = await prisma.document.findUnique({
    where: {
      id: Number(params.documentId),
    },
  });

  const backUrl = `/console/projects/${params.projectId}/documents`;

  return (
    <>
      <PageTitle title="Update Document" backUrl={backUrl} />
      <form action={updateDocument}>
        <input type="hidden" name="id" defaultValue={params.documentId} />
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <DocumentForm item={document} />
          </CardContent>
          <CardFooter>
            <div className="flex ml-auto items-center justify-end gap-x-6">
              <Link
                href={backUrl}
                className={buttonVariants({ variant: "secondary" })}
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
