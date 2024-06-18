import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { DocumentFolderHeader } from "@/components/project/document/document-folder-header";
import { DocumentHeader } from "@/components/project/document/document-header";
import EventsCalendar from "@/components/project/events/project-events";
import { TaskListHeader } from "@/components/project/tasklist/tasklist-header";
import { Badge } from "@/components/ui/badge";
import { getProjectById } from "@/lib/utils/useProjects";
import {
  CalendarPlusIcon,
  FilePlus2Icon,
  FolderPlusIcon,
  ListPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { archiveProject, deleteProject, unarchiveProject } from "../actions";

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
      >
        <div className="pt-2">
          {project.dueDate ? (
            <Badge variant="outline">
              Due {project.dueDate.toLocaleDateString()}
            </Badge>
          ) : null}
          {project.status == "archived" ? (
            <Badge variant="outline" className="ml-2 text-red-500">
              Archived
            </Badge>
          ) : null}
        </div>
      </PageTitle>

      <div className="mx-auto max-w-5xl space-y-12 px-4 md:space-y-0 md:divide-y md:border-l md:border-r md:px-0">
        {project.description ? (
          <div className="flex flex-col p-8">
            <MarkdownView content={project.description ?? ""} />
          </div>
        ) : null}

        <div className="flex h-12 flex-col justify-center">
          <div className="flex justify-between px-4 py-3">
            {/* Left buttons */}
            <div className="isolate inline-flex sm:space-x-3">
              <span className="inline-flex space-x-1"></span>
            </div>

            {/* Right buttons */}
            <span className="isolate inline-flex">
              {project.status == "archived" ? (
                <>
                  <form action={unarchiveProject}>
                    <input
                      className="hidden"
                      name="id"
                      defaultValue={project.id}
                    />
                    <ActionButton label="Unarchive" variant="link" />
                  </form>
                  <form action={deleteProject}>
                    <input
                      className="hidden"
                      name="id"
                      defaultValue={project.id}
                    />
                    <DeleteButton action="Delete" />
                  </form>
                </>
              ) : (
                <form action={archiveProject}>
                  <input
                    className="hidden"
                    name="id"
                    defaultValue={project.id}
                  />
                  <DeleteButton action="Archive" />
                </form>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:p-8">
          <div className="flex flex-col justify-between lg:flex-row lg:items-center">
            <h2 className="text-heading text-2xl leading-7">Task lists</h2>

            <div className="mt-4 flex space-x-4 lg:mt-0">
              <Link
                className="flex items-center"
                href={`/console/projects/${projectId}/tasklists/new`}
              >
                <ListPlusIcon className="mr-1 h-5 w-5" /> Task list
                <span className="sr-only">, document</span>
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
                    className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
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
            label="task list"
            createLink={`/console/projects/${projectId}/tasklists/new`}
          />
        </div>

        <div className="flex flex-col space-y-4 md:p-8">
          <div className="flex flex-col justify-between lg:flex-row lg:items-center">
            <h2 className="text-heading text-2xl leading-7">
              Docs &amp; Files
            </h2>

            <div className="mt-4 flex space-x-4 lg:mt-0">
              <Link
                className="flex items-center"
                href={`/console/projects/${projectId}/documents/new`}
              >
                <FilePlus2Icon className="mr-1 h-5 w-5" /> Document
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
                  className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  {/* @ts-ignore */}
                  <DocumentHeader document={document} />
                </div>
              ))}
              {project.documentFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <DocumentFolderHeader documentFolder={folder} />
                </div>
              ))}
            </ul>
          ) : null}

          <EmptyState
            show={!project.documents.length && !project.documentFolders.length}
            label="document"
            createLink={`/console/projects/${projectId}/documents/new`}
          />
        </div>

        <div className="flex flex-col space-y-4 md:p-8">
          <div className="flex flex-col justify-between lg:flex-row lg:items-center">
            <h2 className="text-heading text-2xl leading-7">Events</h2>

            <div className="mt-4 flex space-x-4 lg:mt-0">
              <Link
                className="flex items-center"
                href={`/console/projects/${projectId}/events/new`}
              >
                <CalendarPlusIcon className="mr-1 h-5 w-5" /> Event
                <span className="sr-only">, document</span>
              </Link>
            </div>
          </div>

          <div className="flex w-full rounded-lg border bg-white dark:bg-black">
            <EventsCalendar projectId={projectId} events={project.events} />
          </div>
        </div>

        <div className="pb-12 md:p-8">
          <CommentsSection type="project" parentId={project.id} />
        </div>
      </div>
    </>
  );
}
