import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { createTaskList } from "../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function CreateTaskList({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}/tasklists`;
  return (
    <>
      <PageTitle title="Create Task list" backUrl={backUrl} />
      <form action={createTaskList}>
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <SharedForm />
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
