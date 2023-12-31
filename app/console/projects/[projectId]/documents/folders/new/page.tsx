import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { createDocumentFolder } from "../../actions";
import SharedForm from "@/components/form/shared";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function CreateDocumentFolder({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}`;
  return (
    <>
      <PageTitle title="Create Folder" backUrl={backUrl} />
      <form action={createDocumentFolder}>
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <SharedForm showDueDate={false} />
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
