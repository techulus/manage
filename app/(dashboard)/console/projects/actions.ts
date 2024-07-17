"use server";

import { comment, project } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { database } from "@/lib/utils/useDatabase";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import { getOwner } from "@/lib/utils/useOwner";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z
    .string()
    .nullable()
    .transform((val) => (val?.trim()?.length ? val : null)),
  dueDate: z
    .string()
    .nullable()
    .transform((val) => (val?.trim()?.length ? new Date(val) : null)),
  status: z.enum(["active", "archived"]),
});

export async function createProject(payload: FormData) {
  const { userId } = getOwner();
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const dueDate = payload.get("dueDate") as string;

  const data = projectSchema.parse({
    name,
    description,
    dueDate,
    status: "active",
  });

  const newProject = await database()
    .insert(project)
    .values({
      ...data,
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
    .get();

  await logActivity({
    action: "created",
    type: "project",
    message: `Created project ${name}`,
    parentId: newProject.id,
    projectId: newProject.id,
  });

  revalidatePath(`/console/projects`);
  redirect(`/console/projects`);
}

export async function updateProject(payload: FormData) {
  const id = Number(payload.get("id"));
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const dueDate = payload.get("dueDate") as string;

  const data = projectSchema.parse({
    name,
    description,
    dueDate,
    status: "active",
  });

  const currentProject = await database()
    .query.project.findFirst({
      where: eq(project.id, +id),
    })
    .execute();

  await database()
    .update(project)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .run();

  await logActivity({
    action: "updated",
    type: "project",
    message: `Updated project ${name}, ${generateObjectDiffMessage(
      currentProject,
      data
    )}`,
    parentId: +id,
    projectId: +id,
  });

  revalidatePath(`/console/projects/${id}`);
  redirect(`/console/projects/${id}`);
}

export async function archiveProject(payload: FormData) {
  const id = Number(payload.get("id"));

  const projectDetails = await database()
    .update(project)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .returning()
    .get();

  await logActivity({
    action: "updated",
    type: "project",
    message: `Archived project ${projectDetails.name}`,
    parentId: id,
    projectId: id,
  });

  revalidatePath("/console/projects");
  redirect("/console/projects");
}

export async function unarchiveProject(payload: FormData) {
  const id = Number(payload.get("id"));

  const projectDetails = await database()
    .update(project)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .returning()
    .get();

  await logActivity({
    action: "updated",
    type: "project",
    message: `Unarchived project ${projectDetails.name}`,
    parentId: id,
    projectId: id,
  });

  revalidatePath("/console/projects");
  revalidatePath(`/console/projects/${id}`);
  redirect(`/console/projects/${id}`);
}

export async function deleteProject(payload: FormData) {
  const id = Number(payload.get("id"));

  await Promise.all([
    database().delete(project).where(eq(project.id, id)).run(),
    database()
      .delete(comment)
      .where(and(eq(comment.parentId, id), eq(comment.type, "project")))
      .run(),
  ]);

  revalidatePath("/console/projects");
  redirect("/console/projects");
}

export async function addComment(payload: FormData) {
  const parentId = Number(payload.get("parentId"));
  const content = payload.get("content") as string;
  const type = payload.get("type") as string;
  const projectId = Number(payload.get("projectId"));

  await database().insert(comment).values({
    type,
    parentId,
    content,
    createdByUser: getOwner().userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await logActivity({
    action: "created",
    type: "comment",
    message: `Created comment: ${convertMarkdownToPlainText(content)}`,
    parentId,
    projectId,
  });

  const currentPath = payload.get("currentPath") as string;
  revalidatePath(currentPath);
}

export async function deleteComment(payload: FormData) {
  const id = Number(payload.get("id"));
  const projectId = Number(payload.get("projectId"));

  await database().delete(comment).where(eq(comment.id, id)).run();

  await logActivity({
    action: "deleted",
    type: "comment",
    message: `Deleted comment`,
    parentId: id,
    projectId,
  });

  const currentPath = payload.get("currentPath") as string;
  revalidatePath(currentPath);
}
