import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import ProjectForm from "@/components/form/project";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { updateProject } from "../../actions";
import Link from "next/link";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditProject({ params }: Props) {
  const { id } = params;

  const project = await prisma.project.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <PageTitle title={project.name} backUrl="/console/projects" />

      <form action={updateProject}>
        <ContentBlock>
          <CardContent>
            <input type="hidden" name="id" value={id} />
            <ProjectForm project={project} />
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
