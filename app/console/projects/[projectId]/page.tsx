import { ContentBlock } from "@/components/core/content-block";
import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { DocumentHeader } from "@/components/project/document-header";
import { TaskListHeader } from "@/components/project/tasklist-header";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { getProjectById } from "@/lib/utils/useProjects";
import { archiveProject } from "../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function ProjectDetails({ params }: Props) {
  const { projectId } = params;

  const project = await getProjectById(projectId, true);

  return (
    <>
      <PageTitle
        title={project.name}
        backUrl="/console/projects"
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/edit`}
      />

      {project.description ? (
        <ContentBlock className="border-none shadow-none">
          <div className="p-6">
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
            className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
          >
            {project.taskLists.map((taskList) => (
              <div
                key={taskList.id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <TaskListHeader taskList={taskList} />
              </div>
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
                href={`/console/projects/${projectId}/documents/new`}
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
            className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
          >
            {project.documents.map((document) => (
              <div
                key={document.id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <DocumentHeader document={document} />
              </div>
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
