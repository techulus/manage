import { ContentBlock } from "@/components/core/content-block";
import CreateProjectForm from "@/components/form/create-project";
import PageTitle from "@/components/layout/page-title";
import { createProject } from "../actions";
import { SaveButton } from "@/components/form/button";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default async function CreateProject() {
  return (
    <>
      <PageTitle title="Create Project" backUrl="/console/projects" />
      <form action={createProject}>
        <ContentBlock>
          <CardContent>
            <CreateProjectForm />
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
