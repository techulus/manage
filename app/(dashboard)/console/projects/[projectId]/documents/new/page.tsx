import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import DocumentForm from "@/components/form/document";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { createDocument } from "../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function CreateDocument({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}/documents`;

  return (
    <>
      <PageTitle title="Create Document" backUrl={backUrl} />
      <form action={createDocument} className="xl:-mt-8">
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <DocumentForm />
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
