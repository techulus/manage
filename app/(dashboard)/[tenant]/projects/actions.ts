"use server";

import { comment, project } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function archiveProject(payload: FormData) {
	const { orgSlug } = await getOwner();
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
	const { orgSlug } = await getOwner();
	const db = await database();
	const id = Number(payload.get("id"));

	await Promise.all([
		db.delete(project).where(eq(project.id, id)).execute(),
		db
			.delete(comment)
			.where(like(comment.roomId, `project/${id}/%`))
			.execute(),
	]);

	revalidatePath(`/${orgSlug}/projects`);
	redirect(`/${orgSlug}/projects`);
}
