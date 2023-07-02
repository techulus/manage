import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import ProjectForm from "@/components/form/project";
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
  return (
    <>
      <PageTitle title="Create Task list" backUrl="/console/projects" />
      <form action={createTaskList}>
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <ProjectForm />
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-end gap-x-6">
              <Link
                href="/console/projects"
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
