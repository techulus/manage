import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { prisma } from "@/lib/utils/db";

interface Props {
  params: {
    id: string;
  };
}

export default async function ProjectDetails({ params }: Props) {
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

      <ContentBlock>Hello</ContentBlock>
    </>
  );
}
