import { ContentBlock } from "@/components/core/content-block";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import Link from "next/link";
import { archiveProject } from "../actions";
import { MarkdownView } from "@/components/core/markdown-view";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function ProjectDetails({ params }: Props) {
  const { ownerId } = getOwner();
  const { projectId } = params;

  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: Number(projectId),
      organizationId: ownerId,
    },
  });

  const taskLists = await prisma.taskList.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          tasks: true,
        },
      },
      // count of active tasks
      tasks: {
        select: {
          id: true,
        },
        where: {
          status: "active",
        },
      },
    },
    where: {
      projectId: Number(projectId),
    },
    take: 5,
  });

  const documents = await prisma.document.findMany({
    where: {
      projectId: Number(projectId),
    },
    take: 5,
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

      {project.description ? (
        <ContentBlock className="border-none">
          <div className="p-6 border-b border-gray-900/5">
            <MarkdownView content={project.description ?? ""} />
          </div>
        </ContentBlock>
      ) : null}

      <ContentBlock>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-7">Tasklists</h2>

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
        </CardHeader>

        <CardContent>
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:gap-x-8"
          >
            {taskLists.map((taskList) => (
              <Link
                key={taskList.id}
                href={`/console/projects/${projectId}/tasklists`}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 dark:bg-gray-900 p-6">
                  <div className="text-md font-medium leading-6">
                    {taskList.name}
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        </CardContent>
      </ContentBlock>

      <ContentBlock>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-7">Documents</h2>

            <div>
              <a
                href={`/console/projects/${projectId}/tasklists/new`}
                className={buttonVariants({ variant: "link" })}
              >
                Create<span className="sr-only">, document</span>
              </a>

              <a
                href={`/console/projects/${projectId}/documents`}
                className={buttonVariants({ variant: "link" })}
              >
                View all<span className="sr-only">, documents</span>
              </a>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:gap-x-8"
          >
            {documents.map(({ id, name }) => (
              <Link
                key={id}
                href={`/console/projects/${projectId}/documents`}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                  <div className="text-md font-medium leading-6">{name}</div>
                </div>
              </Link>
            ))}
          </ul>
        </CardContent>
      </ContentBlock>

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
                    <input
                      className="hidden"
                      name="id"
                      defaultValue={project.id}
                    />
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
