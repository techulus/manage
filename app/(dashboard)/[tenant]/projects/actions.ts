"use server";

import { activity, comment, project } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { broadcastEvent } from "@/lib/utils/cable-server";
import { database } from "@/lib/utils/useDatabase";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import { getOwner } from "@/lib/utils/useOwner";
import { and, desc, eq } from "drizzle-orm";
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
	const { userId, orgSlug, ownerId } = await getOwner();
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const dueDate = payload.get("dueDate") as string;

	const data = projectSchema.parse({
		name,
		description,
		dueDate,
		status: "active",
	});

	const db = await database();
	const newProject = db
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
		projectId: newProject.id,
	});

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects`);
	redirect(`/${orgSlug}/projects`);
}

export async function updateProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
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

	const db = await database();
	const currentProject = await db.query.project
		.findFirst({
			where: eq(project.id, +id),
		})
		.execute();

	db.update(project)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(project.id, id))
		.run();

	if (currentProject) {
		await logActivity({
			action: "updated",
			type: "project",
			message: `Updated project ${name}, ${generateObjectDiffMessage(
				currentProject,
				data,
			)}`,
			projectId: +id,
		});
	}

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects/${id}`);
	redirect(`/${orgSlug}/projects/${id}`);
}

export async function archiveProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const id = Number(payload.get("id"));

	const db = await database();
	const projectDetails = db
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
		projectId: id,
	});

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects`);
	redirect(`/${orgSlug}/projects`);
}

export async function unarchiveProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const id = Number(payload.get("id"));

	const db = await database();
	const projectDetails = db
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
		projectId: id,
	});

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects`);
	revalidatePath(`/${orgSlug}/projects/${id}`);
	redirect(`/${orgSlug}/projects/${id}`);
}

export async function deleteProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const db = await database();
	const id = Number(payload.get("id"));

	await Promise.all([
		db.delete(project).where(eq(project.id, id)).run(),
		db
			.delete(comment)
			.where(and(eq(comment.parentId, id), eq(comment.type, "project")))
			.run(),
	]);

	await broadcastEvent("update_sidebar", ownerId);

	revalidatePath(`/${orgSlug}/projects`);
	redirect(`/${orgSlug}/projects`);
}

export async function addComment(payload: FormData) {
	const parentId = Number(payload.get("parentId"));
	const content = payload.get("content") as string;
	const type = payload.get("type") as string;
	const projectId = Number(payload.get("projectId"));
	const { userId } = await getOwner();

	const db = await database();
	await db.insert(comment).values({
		type,
		parentId,
		content,
		createdByUser: userId,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await logActivity({
		action: "created",
		type: "comment",
		message: `Created comment: ${convertMarkdownToPlainText(content)}`,
		projectId,
	});

	const currentPath = payload.get("currentPath") as string;
	revalidatePath(currentPath);
}

export async function deleteComment(payload: FormData) {
	const id = Number(payload.get("id"));
	const projectId = Number(payload.get("projectId"));

	const db = await database();
	db.delete(comment).where(eq(comment.id, id)).run();

	await logActivity({
		action: "deleted",
		type: "comment",
		message: "Deleted comment",
		projectId,
	});

	const currentPath = payload.get("currentPath") as string;
	revalidatePath(currentPath);
}

export async function fetchActivities(projectId: string | number, offset = 0) {
	const db = await database();

	const activities = await db.query.activity
		.findMany({
			with: {
				actor: {
					columns: {
						id: true,
						firstName: true,
						imageUrl: true,
					},
				},
			},
			where: eq(activity.projectId, +projectId),
			orderBy: [desc(activity.createdAt)],
			limit: 50,
			offset,
		})
		.execute();

	return activities;
}
