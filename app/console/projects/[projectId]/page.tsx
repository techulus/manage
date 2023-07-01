import { ContentBlock } from "@/components/core/content-block";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import Link from "next/link";
import { archiveProject } from "../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function ProjectDetails({ params }: Props) {
  const ownerId = getOwner();
  const { projectId } = params;

  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: Number(projectId),
      ownerId,
    },
  });

  const taskLists = await prisma.taskList.findMany({
    where: {
      projectId: Number(projectId),
      ownerId,
    },
    take: 2,
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
        actionLink={`/console/projects/${projectId}/edit`}
      />

      <div className="mx-auto max-w-5xl px-4 lg:px-0 my-12">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-7 text-gray-900">
              Tasklists
            </h2>

            <div>
              <a
                href={`/console/projects/${projectId}/tasklists/new`}
                className={buttonVariants({ variant: "link" })}
              >
                Create<span className="sr-only">, tasklist</span>
              </a>

              <a
                href={`/console/projects/${projectId}/tasklists`}
                className={buttonVariants({ variant: "link" })}
              >
                View all<span className="sr-only">, tasklists</span>
              </a>
            </div>
          </div>
          <ul
            role="list"
            className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
          >
            {taskLists.map((taskList) => (
              <Link
                key={taskList.id}
                href={`/console/projects/${projectId}/tasklists`}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                  <div className="text-sm font-medium leading-6 text-gray-900">
                    {taskList.name}
                  </div>
                </div>
              </Link>
            ))}

            <li className="overflow-hidden rounded-xl border border-gray-200">
              <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                <div className="text-sm font-medium leading-6 text-gray-900">
                  Create new list
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

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
    </>
  );
}
