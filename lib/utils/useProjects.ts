import { db } from "@/drizzle/db";
import { document, project, taskList } from "@/drizzle/schema";
import { Document, Project } from "@/drizzle/types";
import { eq, like } from "drizzle-orm";

export async function getProjectsForOwner({
  ownerId,
  search,
}: {
  ownerId: string;
  search?: string;
}): Promise<{
  projects: Project[];
}> {
  const query = db
    .select()
    .from(project)
    .where(eq(project.organizationId, ownerId));

  if (search) {
    query.where(like(project.name, `%${search}%`));
  }

  const projects: Project[] = await query.all();

  return { projects };
}

export async function getProjectById(
  projectId: string | number
): Promise<Project> {
  const projects: Project[] = await db
    .select()
    .from(project)
    .where(eq(project.id, Number(projectId)))
    .all();

  if (!projects.length) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  return projects[0];
}

export async function getTaskListById(taskListId: string | number) {
  const taskLists = await db
    .select()
    .from(taskList)
    .where(eq(taskList.id, Number(taskListId)))
    .all();

  if (!taskLists.length) {
    throw new Error(`TaskList with id ${taskListId} not found`);
  }

  return taskLists[0];
}

export async function getDocumentById(documentId: string | number) {
  const documents: Document[] = await db
    .select()
    .from(document)
    .where(eq(document.id, Number(documentId)))
    .all();

  if (!documents.length) {
    throw new Error(`Document with id ${documentId} not found`);
  }

  return documents[0];
}
