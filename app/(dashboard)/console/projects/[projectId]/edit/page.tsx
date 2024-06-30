import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getProjectById } from "@/lib/utils/useProjects";
import Link from "next/link";
import { updateProject } from "../../actions";

interface Props {
  params: {
    projectId: string;
  };
}

export default async function EditProject({ params }: Props) {
  const { projectId } = params;

  const project = await getProjectById(projectId);

  return (
    <>
      <PageTitle title={project.name} backUrl="/console/projects" />

      <form action={updateProject} className="xl:-mt-8">
        <ContentBlock>
          <CardContent>
            <input type="hidden" name="id" defaultValue={projectId} />
            <SharedForm item={project} />
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-end gap-x-6">
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
