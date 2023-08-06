import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import SharedForm from "@/components/form/shared";
import { updateDocumentFolder } from "../../../actions";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { documentFolder } from "@/drizzle/schema";

type Props = {
  params: {
    projectId: string;
    folderId: string;
  };
};

export default async function EditDocumentFolder({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}/folders/${params.folderId}`;
  const folder = await db.query.documentFolder.findFirst({
    where: eq(documentFolder.id, Number(params.folderId)),
  });

  return (
    <>
      <PageTitle title="Update Folder" backUrl={backUrl} />
      <form action={updateDocumentFolder}>
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <input type="hidden" name="id" defaultValue={params.folderId} />
        <ContentBlock>
          <CardContent>
            <SharedForm showDueDate={false} item={folder} />
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center justify-end gap-x-6">
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
