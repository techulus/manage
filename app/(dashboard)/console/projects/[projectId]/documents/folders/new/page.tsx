import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { createDocumentFolder } from "../../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function CreateDocumentFolder({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}/documents`;
  return (
    <>
      <PageTitle title="Create Folder" backUrl={backUrl} />
      <form action={createDocumentFolder} className="xl:-mt-8">
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <SharedForm showDueDate={false} />
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center justify-end gap-x-6">
              <Link
                href={backUrl}
                className={buttonVariants({ variant: "ghost" })}
                prefetch={false}
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
