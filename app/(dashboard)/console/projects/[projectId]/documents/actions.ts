"use server";

import { blob, comment, document, documentFolder } from "@/drizzle/schema";
import { deleteFile } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { deleteFilesInMarkdown } from "@/lib/utils/useMarkdown";
import { getOwner } from "@/lib/utils/useOwner";
import { and, eq } from "drizzle-orm";
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

  await database()
    .insert(document)
    .values({
      ...data,
      projectId: +projectId,
      folderId: folderId ? +folderId : null,
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

  await database()
    .update(document)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(document.id, +id))
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

  await database()
    .insert(documentFolder)
    .values({
      ...data,
      projectId: +projectId,
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

  await database()
    .update(documentFolder)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documentFolder.id, +id))
    .run();

  revalidatePath(`/console/projects/${projectId}`);
  revalidatePath(`/console/projects/${projectId}/documents/folders/${id}`);
  redirect(`/console/projects/${projectId}/documents/folders/${id}`);
}

export async function deleteDocumentFolder(payload: FormData) {
  const id = payload.get("id") as string;
  const projectId = payload.get("projectId") as string;
  const currentPath = payload.get("currentPath") as string;

  await Promise.all([
    database().delete(documentFolder).where(eq(documentFolder.id, +id)).run(),
    database()
      .delete(comment)
      .where(and(eq(comment.type, "folder"), eq(comment.parentId, +id)))
      .run(),
  ]);

  revalidatePath(currentPath);
  redirect(`/console/projects/${projectId}`);
}

export async function deleteDocument(
  id: string,
  projectId: string,
  content: string | null,
  folderId: number | null
) {
  if (content) {
    await deleteFilesInMarkdown(content);
  }

  await Promise.all([
    database().delete(document).where(eq(document.id, +id)).run(),
    database()
      .delete(comment)
      .where(and(eq(comment.type, "document"), eq(comment.parentId, +id)))
      .run(),
  ]);

  if (folderId) {
    revalidatePath(
      `/console/projects/${projectId}/documents/folders/${folderId}`
    );
    revalidatePath(`/console/projects/${projectId}/documents/${id}`);
    redirect(`/console/projects/${projectId}/documents/folders/${folderId}`);
  }

  revalidatePath(`/console/projects/${projectId}`);
  revalidatePath(`/console/projects/${projectId}/documents/${id}`);
  redirect(`/console/projects/${projectId}`);
}

export async function reloadDocuments(
  projectId: string | number,
  folderId: string | number | null
) {
  if (folderId) {
    revalidatePath(
      `/console/projects/${projectId}/documents/folders/${folderId}`
    );
    redirect(`/console/projects/${projectId}/documents/folders/${folderId}`);
  }

  revalidatePath(`/console/projects/${projectId}`);
  redirect(`/console/projects/${projectId}`);
}

export async function deleteBlob(file: { id: string; key: string }) {
  await deleteFile(file.key);
  await database().delete(blob).where(eq(blob.id, file.id)).run();
}