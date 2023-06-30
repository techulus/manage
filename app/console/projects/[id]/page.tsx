import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { prisma } from "@/lib/utils/db";
import { archiveProject } from "../actions";
import { DeleteButton } from "@/components/form/button";

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
      <PageTitle
        title={project.name}
        backUrl="/console/projects"
        actionLabel="Edit"
        actionLink={`/console/projects/${id}/edit`}
      />

      {/* Toolbar*/}
      <ContentBlock>
        <div className="hidden md:flex h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 lg:-mx-4">
            <div className="flex justify-between py-3">
              {/* Left buttons */}
              <div className="isolate inline-flex sm:space-x-3">
                <span className="inline-flex space-x-1"></span>
              </div>

              {/* Right buttons */}
              <nav aria-label="Pagination">
                <span className="isolate inline-flex">
                  <form action={archiveProject}>
                    <input className="hidden" name="id" value={project.id} />
                    <DeleteButton action="Archive" />
                  </form>
                </span>
              </nav>
            </div>
          </div>
        </div>
      </ContentBlock>

      <ContentBlock>Hello</ContentBlock>
    </>
  );
}
