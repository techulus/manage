import { db } from "@/drizzle/db";
import { document, project, taskList } from "@/drizzle/schema";
import { and, eq, like, isNull, or } from "drizzle-orm";
import { getOwner } from "./useOwner";
import { ProjectWithCreator, ProjectWithData } from "@/drizzle/types";

export async function getProjectsForOwner({
  search,
  statuses = ["active"],
}: {
  search?: string;
  statuses?: string[];
}): Promise<{
  projects: ProjectWithCreator[];
  archivedProjects: ProjectWithCreator[];
}> {
  const { ownerId } = getOwner();

  const statusFilter = statuses?.map((status) =>
    eq(project.status, status)
  );

  const projects = await db.query.project
    .findMany({
      where: search
        ? and(
          eq(project.organizationId, ownerId),
          like(project.name, `%${search}%`),
          or(...statusFilter)
        )
        :
        and(
          eq(project.organizationId, ownerId),
          or(...statusFilter)
        )
      ,
      with: {
        creator: true,
      },
    });

  const archivedProjects = await db.query.project
    .findMany({
      where: search
        ? and(
          eq(project.organizationId, ownerId),
          eq(project.status, "archived"),
          like(project.name, `%${search}%`),
        )
        :
        and(
          eq(project.organizationId, ownerId),
          eq(project.status, "archived"),
        )
      ,
      with: {
        creator: true,
      },
    });

  return { projects, archivedProjects };
}

export async function getProjectById(
  projectId: string | number,
  withTasksAndDocs = false
): Promise<ProjectWithData> {
  const { ownerId } = getOwner();

  const data = await db.query.project
    .findFirst({
      where: and(
        eq(project.id, Number(projectId)),
        eq(project.organizationId, ownerId)
      ),
      with: withTasksAndDocs
        ? {
          taskLists: {
            where: eq(taskList.status, "active"),
            with: {
              tasks: true,
            },
          },
          documents: {
            where: isNull(document.folderId),
            with: {
              creator: {
                columns: {
                  firstName: true,
                  imageUrl: true,
                },
              },
            },
          },
          documentFolders: {
            with: {
              creator: {
                columns: {
                  firstName: true,
                  imageUrl: true,
                },
              },
              // I can't get count query to work, so I'm just selecting the id :(
              documents: {
                columns: {
                  id: true,
                },
              },
            },
          },
        }
        : {},
    })
    .execute();

  if (!data) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  return data as ProjectWithData;
}

export async function getTaskListById(taskListId: string | number) {
  const data = await db.query.taskList
    .findFirst({
      where: eq(taskList.id, Number(taskListId)),
    })
    .execute();

  if (!data) {
    throw new Error(`TaskList with id ${taskListId} not found`);
  }

  return data;
}

export async function getDocumentById(documentId: string | number) {
  const data = await db.query.document
    .findFirst({
      where: eq(document.id, Number(documentId)),
    })
    .execute();

  if (!data) {
    throw new Error(`Document with id ${documentId} not found`);
  }

  return data;
}
