"use server";

import { comment, project } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { trpc } from "@/trpc/server";
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
	const newProject = await db
		.insert(project)
		.values({
			...data,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning({ id: project.id })
		.execute();

	await logActivity({
		action: "created",
		type: "project",
		message: `Created project ${name}`,
		projectId: newProject?.[0].id,
	});

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
		.execute();

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

	revalidatePath(`/${orgSlug}/projects/${id}`);
	redirect(`/${orgSlug}/projects/${id}`);
}

export async function archiveProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const id = Number(payload.get("id"));

	const db = await database();
	const projectDetails = await db
		.update(project)
		.set({
			status: "archived",
			updatedAt: new Date(),
		})
		.where(eq(project.id, id))
		.returning({ name: project.name })
		.execute();

	await logActivity({
		action: "updated",
		type: "project",
		message: `Archived project ${projectDetails?.[0].name}`,
		projectId: id,
	});

	revalidatePath(`/${orgSlug}/projects`);
	redirect(`/${orgSlug}/projects`);
}

export async function unarchiveProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const id = Number(payload.get("id"));

	const db = await database();
	const projectDetails = await db
		.update(project)
		.set({
			status: "active",
			updatedAt: new Date(),
		})
		.where(eq(project.id, id))
		.returning({ name: project.name })
		.execute();

	await logActivity({
		action: "updated",
		type: "project",
		message: `Unarchived project ${projectDetails?.[0].name}`,
		projectId: id,
	});

	revalidatePath(`/${orgSlug}/projects`);
	revalidatePath(`/${orgSlug}/projects/${id}`);
	redirect(`/${orgSlug}/projects/${id}`);
}

export async function deleteProject(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const db = await database();
	const id = Number(payload.get("id"));

	await Promise.all([
		db.delete(project).where(eq(project.id, id)).execute(),
		db
			.delete(comment)
			.where(and(eq(comment.parentId, id), eq(comment.type, "project")))
			.execute(),
	]);

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
		message: "Commented",
		projectId,
	});

	const currentPath = payload.get("currentPath") as string;
	revalidatePath(currentPath);
}

export async function deleteComment(payload: FormData) {
	const id = Number(payload.get("id"));
	const projectId = Number(payload.get("projectId"));

	const db = await database();
	db.delete(comment).where(eq(comment.id, id)).execute();

	await logActivity({
		action: "deleted",
		type: "comment",
		message: "Deleted comment",
		projectId,
	});

	const currentPath = payload.get("currentPath") as string;
	revalidatePath(currentPath);
}
