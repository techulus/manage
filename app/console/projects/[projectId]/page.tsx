import { ContentBlock } from "@/components/core/content-block";
import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { DocumentHeader } from "@/components/project/document/document-header";
import { TaskListHeader } from "@/components/project/tasklist/tasklist-header";
import { CardContent, CardHeader } from "@/components/ui/card";
import { getProjectById } from "@/lib/utils/useProjects";
import Link from "next/link";
import { archiveProject } from "../actions";
import { DocumentPlusIcon, FolderPlusIcon } from "@heroicons/react/20/solid";
import { DocumentFolderHeader } from "@/components/project/document/document-folder-header";
import { ListPlusIcon } from "lucide-react";

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
        subTitle={
          project.dueDate ? `Due ${project.dueDate.toDateString()}` : ""
        }
        backUrl="/console/projects"
        actionLabel="Edit"
        actionLink={`/console/projects/${projectId}/edit`}
      />

      <div className="space-y-16">
        {project.description ? (
          <div className="mx-auto flex max-w-5xl flex-col space-y-4">
            <MarkdownView content={project.description ?? ""} />
          </div>
        ) : null}

        <div className="mx-auto flex max-w-5xl flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Link href={`/console/projects/${projectId}/tasklists`}>
              <h2 className="text-2xl font-semibold leading-7">Task Lists</h2>
            </Link>

            <div>
              <Link
                href={`/console/projects/${projectId}/tasklists/new`}
                className="flex items-center"
              >
                <ListPlusIcon className="mr-1 h-5 w-5" />
                List<span className="sr-only">, tasklist</span>
              </Link>
            </div>
          </div>

          {project.taskLists.length ? (
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
            >
              {project.taskLists.map((taskList) => {
                return (
                  <div
                    key={taskList.id}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <TaskListHeader
                      taskList={taskList}
                      totalCount={taskList.tasks.length}
                      doneCount={
                        taskList.tasks.filter((task) => task.status === "done")
                          .length
                      }
                    />
                  </div>
                );
              })}
            </ul>
          ) : null}

          <EmptyState
            show={!project.taskLists.length}
            label="tasklist"
            createLink={`/console/projects/${projectId}/tasklists/new`}
          />
        </div>

        <div className="mx-auto flex max-w-5xl flex-col space-y-4">
          <div className="flex flex-col justify-between lg:flex-row lg:items-center">
            <h2 className="text-2xl font-semibold leading-7">
              Docs &amp; Files
            </h2>

            <div className="mt-4 flex space-x-4 lg:mt-0">
              <Link
                className="flex items-center"
                href={`/console/projects/${projectId}/documents/new`}
              >
                <DocumentPlusIcon className="mr-1 h-5 w-5" /> Document
                <span className="sr-only">, document</span>
              </Link>

              <Link
                className="flex items-center"
                href={`/console/projects/${projectId}/documents/folders/new`}
              >
                <FolderPlusIcon className="mr-1 h-5 w-5" /> Folder
                <span className="sr-only">, folder</span>
              </Link>
            </div>
          </div>

          {project.documents.length || project.documentFolders.length ? (
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
            >
              {project.documents.map((document) => (
                <div
                  key={document.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  {/* @ts-ignore */}
                  <DocumentHeader document={document} />
                </div>
              ))}
              {project.documentFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <DocumentFolderHeader documentFolder={folder} />
                </div>
              ))}
            </ul>
          ) : null}

          <EmptyState
            show={!project.documents.length}
            label="document"
            createLink={`/console/projects/${projectId}/documents/new`}
          />
        </div>

        <ContentBlock>
          <div className="hidden h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800 md:flex">
            <div className="px-4 sm:px-6 lg:-mx-4 lg:px-8">
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
      </div>
    </>
  );
}
