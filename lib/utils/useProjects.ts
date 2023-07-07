import { db } from "@/drizzle/db";
import { document, project, taskList } from "@/drizzle/schema";
import { Document, Project, TaskList } from "@/drizzle/types";
import { and, eq, like } from "drizzle-orm";
import { getOwner } from "./useOwner";

type ProjectWithData = Project & {
  taskLists: TaskList[];
  documents: Document[];
};

export async function getProjectsForOwner({
  search,
}: {
  search?: string;
}): Promise<{
  projects: Project[];
}> {
  const { ownerId } = getOwner();

  const projects = await db.query.project
    .findMany({
      where: search
        ? and(
            eq(project.organizationId, ownerId),
            like(project.name, `%${search}%`)
          )
        : eq(project.organizationId, ownerId),
    })
    .execute();

  return { projects };
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
            taskLists: true,
            documents: true,
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
