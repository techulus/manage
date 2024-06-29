import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { createProject } from "../actions";

export default async function CreateProject() {
  return (
    <>
      <PageTitle title="Create Project" backUrl="/console/projects" />
      <form action={createProject} className="xl:-mt-8">
        <ContentBlock>
          <CardContent>
            <SharedForm />
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center justify-end gap-x-6">
              <Link
                href="/console/projects"
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
