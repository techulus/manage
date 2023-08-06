"use server";

import { db } from "@/drizzle/db";
import { document, documentFolder } from "@/drizzle/schema";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

const documentSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  markdownContent: z.string(),
  status: z.enum(["active", "archived"]),
});

const documentFolderSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string(),
});

export async function createDocument(payload: FormData) {
  const { userId } = getOwner();
  const name = payload.get("name") as string;
  const markdownContent = payload.get("markdownContent") as string;
  const projectId = payload.get("projectId") as string;
  const folderId = (payload.get("folderId") as string) ?? null;

  const data = documentSchema.parse({
    name,
    markdownContent,
    status: "active",
  });

  await db
    .insert(document)
    .values({
      ...data,
      projectId: Number(projectId),
      folderId: folderId ? Number(folderId) : null,
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();

  revalidatePath(`/console/projects/${projectId}`);

  if (folderId) {
    revalidatePath(
      `/console/projects/${projectId}/documents/folders/${folderId}`
    );
    redirect(`/console/projects/${projectId}/documents/folders/${folderId}`);
  } else {
    redirect(`/console/projects/${projectId}`);
  }
}

export async function updateDocument(payload: FormData) {
  const name = payload.get("name") as string;
  const markdownContent = payload.get("markdownContent") as string;
  const id = payload.get("id") as string;
  const projectId = payload.get("projectId") as string;
  const folderId = (payload.get("folderId") as string) ?? null;

  const data = documentSchema.parse({
    name,
    markdownContent,
    status: "active",
  });

  await db
    .update(document)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(document.id, Number(id)))
    .run();

  revalidatePath(`/console/projects/${projectId}`);

  if (folderId) {
    revalidatePath(
      `/console/projects/${projectId}/documents/folders/${folderId}`
    );
    redirect(`/console/projects/${projectId}/documents/folders/${folderId}`);
  } else {
    redirect(`/console/projects/${projectId}`);
  }
}

export async function createDocumentFolder(payload: FormData) {
  const { userId } = getOwner();
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const projectId = payload.get("projectId") as string;

  const data = documentFolderSchema.parse({
    name,
    description,
  });

  await db
    .insert(documentFolder)
    .values({
      ...data,
      projectId: Number(projectId),
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();

  revalidatePath(`/console/projects/${projectId}`);
  redirect(`/console/projects/${projectId}`);
}

export async function updateDocumentFolder(payload: FormData) {
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const id = payload.get("id") as string;
  const projectId = payload.get("projectId") as string;

  const data = documentFolderSchema.parse({
    name,
    description,
  });

  await db
    .update(documentFolder)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documentFolder.id, Number(id)))
    .run();

  revalidatePath(`/console/projects/${projectId}`);
  revalidatePath(`/console/projects/${projectId}/documents/folders/${id}`);
  redirect(`/console/projects/${projectId}/documents/folders/${id}`);
}
