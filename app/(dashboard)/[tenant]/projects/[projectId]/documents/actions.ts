"use server";

import { blob, comment, document, documentFolder } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { deleteFile } from "@/lib/blobStore";
import { broadcastEvent } from "@/lib/utils/turbowire";
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
	const { userId, orgSlug } = await getOwner();
	const name = payload.get("name") as string;
	const markdownContent = payload.get("markdownContent") as string;
	const projectId = payload.get("projectId") as string;
	const folderId = (payload.get("folderId") as string) ?? null;

	const data = documentSchema.parse({
		name,
		markdownContent,
		status: "active",
	});

	const db = await database();
	await db
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

	await logActivity({
		action: "created",
		type: "document",
		message: `Created document ${name}`,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}`);

	if (folderId) {
		revalidatePath(
			`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`,
		);
		redirect(`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`);
	} else {
		redirect(`/${orgSlug}/projects/${projectId}/documents`);
	}
}

export async function updateDocument(payload: FormData) {
	const { orgSlug } = await getOwner();
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

	const db = await database();
	const currentDocument = await db.query.document
		.findFirst({ where: eq(document.id, +id) })
		.execute();

	const documentDetails = await db
		.update(document)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(document.id, +id))
		.returning()
		.get();

	if (currentDocument) {
		await logActivity({
			action: "updated",
			type: "document",
			message: `Updated document ${
				documentDetails.name
			}, ${generateObjectDiffMessage(currentDocument, data)}`,
			projectId: +projectId,
		});
	}

	revalidatePath(`/${orgSlug}/projects/${projectId}`);

	if (folderId) {
		revalidatePath(
			`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`,
		);
		redirect(`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`);
	} else {
		redirect(`/${orgSlug}/projects/${projectId}/documents/${id}`);
	}
}

export async function createDocumentFolder(payload: FormData) {
	const { userId, orgSlug, ownerId } = await getOwner();
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const projectId = payload.get("projectId") as string;

	const data = documentFolderSchema.parse({
		name,
		description,
	});

	const db = await database();
	db.insert(documentFolder)
		.values({
			...data,
			projectId: +projectId,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.run();

	await logActivity({
		action: "created",
		type: "folder",
		message: `Created document folder ${name}`,
		projectId: +projectId,
	});

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects/${projectId}`);
	revalidatePath(`/${orgSlug}/projects/${projectId}/documents`);
	redirect(`/${orgSlug}/projects/${projectId}/documents`);
}

export async function updateDocumentFolder(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const id = payload.get("id") as string;
	const projectId = payload.get("projectId") as string;

	const data = documentFolderSchema.parse({
		name,
		description,
	});

	const db = await database();
	const currentFolder = await db.query.documentFolder
		.findFirst({ where: eq(documentFolder.id, +id) })
		.execute();

	const folderDetails = await db
		.update(documentFolder)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(documentFolder.id, +id))
		.returning()
		.get();

	if (currentFolder)
		await logActivity({
			action: "updated",
			type: "folder",
			message: `Updated document folder ${
				folderDetails.name
			}, ${generateObjectDiffMessage(currentFolder, data)}`,
			projectId: +projectId,
		});

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects/${projectId}`);
	revalidatePath(`/${orgSlug}/projects/${projectId}/documents/folders/${id}`);
	redirect(`/${orgSlug}/projects/${projectId}/documents/folders/${id}`);
}

export async function deleteDocumentFolder(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const id = payload.get("id") as string;
	const projectId = payload.get("projectId") as string;
	const currentPath = payload.get("currentPath") as string;

	const db = await database();
	const [folderDetails, ..._] = await Promise.all([
		db
			.delete(documentFolder)
			.where(eq(documentFolder.id, +id))
			.returning()
			.get(),
		db
			.delete(comment)
			.where(and(eq(comment.type, "folder"), eq(comment.parentId, +id)))
			.run(),
	]);

	await logActivity({
		action: "deleted",
		type: "folder",
		message: `Deleted document folder ${folderDetails?.name}`,
		projectId: +projectId,
	});

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(currentPath);
	redirect(`/${orgSlug}/projects/${projectId}/documents`);
}

export async function deleteDocument(
	id: string,
	projectId: string,
	content: string | null,
	folderId: number | null,
) {
	const { orgSlug } = await getOwner();

	if (content) {
		await deleteFilesInMarkdown(content);
	}

	const db = await database();
	const [documentDetails, ..._] = await Promise.all([
		db.delete(document).where(eq(document.id, +id)).returning().get(),
		db
			.delete(comment)
			.where(and(eq(comment.type, "document"), eq(comment.parentId, +id)))
			.run(),
	]);

	await logActivity({
		action: "deleted",
		type: "document",
		message: `Deleted document ${documentDetails?.name}`,
		projectId: +projectId,
	});

	if (folderId) {
		revalidatePath(
			`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`,
		);
		revalidatePath(`/${orgSlug}/projects/${projectId}/documents/${id}`);
		redirect(`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`);
	}

	revalidatePath(`/${orgSlug}/projects/${projectId}`);
	revalidatePath(`/${orgSlug}/projects/${projectId}/documents`);
	revalidatePath(`/${orgSlug}/projects/${projectId}/documents/${id}`);
	redirect(`/${orgSlug}/projects/${projectId}/documents`);
}

export async function reloadDocuments(
	projectId: string | number,
	folderId: string | number | null,
) {
	const { orgSlug } = await getOwner();
	if (folderId) {
		revalidatePath(
			`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`,
		);
		redirect(`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}`);
	}

	revalidatePath(`/${orgSlug}/projects/${projectId}`);
	redirect(`/${orgSlug}/projects/${projectId}`);
}

export async function deleteBlob(
	file: { id: string; key: string },
	projectId: string | number,
) {
	await deleteFile(file.key);

	const db = await database();
	const blobDetails = await db
		.delete(blob)
		.where(eq(blob.id, file.id))
		.returning()
		.get();

	await logActivity({
		action: "deleted",
		type: "blob",
		message: `Deleted file ${blobDetails?.name}`,
		projectId: +projectId,
	});
}
