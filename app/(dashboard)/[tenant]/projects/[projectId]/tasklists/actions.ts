"use server";

import { notificationType } from "@/data/notification";
import { notification, task, taskList } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { broadcastEvent } from "@/lib/utils/turbowire";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

const POSITION_INCREMENT = 1000;

const taskListSchema = z.object({
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

const taskSchema = z.object({
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
	status: z.enum(["todo", "done"]),
});

export async function createTaskList(payload: FormData) {
	const { userId, orgSlug, ownerId } = await getOwner();
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const dueDate = payload.get("dueDate") as string;
	const projectId = payload.get("projectId") as string;

	const data = taskListSchema.parse({
		name,
		description,
		dueDate,
		status: "active",
	});

	const db = await database();
	db.insert(taskList)
		.values({
			...data,
			projectId: +projectId,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.execute();

	await logActivity({
		action: "created",
		type: "tasklist",
		message: `Created task list ${name}`,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
	redirect(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function updateTaskList(payload: FormData) {
	const { orgSlug, ownerId } = await getOwner();
	const id = payload.get("id") as string;
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const dueDate = payload.get("dueDate") as string;
	const projectId = payload.get("projectId") as string;

	const data = taskListSchema.parse({
		name,
		description,
		dueDate,
		status: "active",
	});

	const db = await database();
	const currentTasklist = await db.query.taskList
		.findFirst({
			where: eq(taskList.id, +id),
		})
		.execute();

	db.update(taskList)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(taskList.id, +id))
		.execute();

	if (currentTasklist)
		await logActivity({
			action: "updated",
			type: "tasklist",
			message: `Updated task list ${name}, ${generateObjectDiffMessage(
				currentTasklist,
				data,
			)}`,
			projectId: +projectId,
		});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
	redirect(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function partialUpdateTaskList(
	id: number,
	data: { description: string } | { status: string },
) {
	const { orgSlug } = await getOwner();
	const db = await database();
	const currentTasklist = await db.query.taskList
		.findFirst({
			where: eq(taskList.id, +id),
		})
		.execute();

	const updated = await db
		.update(taskList)
		.set({
			...data,
		})
		.where(eq(taskList.id, +id))
		.returning({ name: taskList.name, projectId: taskList.projectId })
		.execute();

	if (currentTasklist)
		await logActivity({
			action: "updated",
			type: "tasklist",
			message: `Updated task list ${updated?.[0].name}, ${generateObjectDiffMessage(
				currentTasklist,
				updated[0],
			)}`,
			projectId: +updated?.[0].projectId,
		});

	revalidatePath(`/${orgSlug}/projects/${updated?.[0].projectId}/tasklists`);
}

export async function deleteTaskList(payload: FormData) {
	const id = payload.get("id") as string;
	const projectId = payload.get("projectId") as string;

	const { orgSlug, ownerId } = await getOwner();
	const db = await database();
	const taskListDetails = await db
		.delete(taskList)
		.where(eq(taskList.id, +id))
		.returning({ name: taskList.name })
		.execute();

	await logActivity({
		action: "deleted",
		type: "tasklist",
		message: `Deleted task list ${taskListDetails?.[0].name}`,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function createTask({
	userId,
	taskListId,
	projectId,
	name,
	description = "",
	dueDate = "",
}: {
	userId: string;
	taskListId: number;
	projectId: number;
	name: string;
	description?: string;
	dueDate?: string;
}) {
	const { orgSlug } = await getOwner();
	const data = taskSchema.parse({
		name,
		description,
		dueDate,
		status: "todo",
	});

	const db = await database();
	const lastPosition = await db.query.task
		.findFirst({
			where: eq(task.taskListId, +taskListId),
			orderBy: [desc(task.position)],
		})
		.execute();

	const position = lastPosition?.position
		? lastPosition?.position + POSITION_INCREMENT
		: 1;

	db.insert(task)
		.values({
			...data,
			position,
			taskListId: +taskListId,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.execute();

	await logActivity({
		action: "created",
		type: "task",
		message: `Created task ${name}`,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function updateTask(
	id: number,
	projectId: number,
	data:
		| { description: string }
		| { status: string }
		| { position: number }
		| { name: string }
		| { assignedToUser: string | null }
		| { dueDate: Date | null },
) {
	const { orgSlug, userId } = await getOwner();
	const db = await database();
	const currentTask = await db.query.task
		.findFirst({
			where: eq(task.id, +id),
		})
		.execute();

	const taskDetails = await db
		.update(task)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(task.id, +id))
		.returning({
			name: task.name,
			taskListId: task.taskListId,
			assignedToUser: task.assignedToUser,
		})
		.execute();

	if (currentTask)
		await logActivity({
			action: "updated",
			type: "task",
			message: `Updated task ${taskDetails?.[0].name}, ${generateObjectDiffMessage(
				currentTask,
				taskDetails[0],
			)}`,
			projectId: +projectId,
		});

	if ("assignedToUser" in data && data.assignedToUser) {
		db.insert(notification)
			.values({
				type: notificationType.assign,
				message: `You have been assigned to task "${taskDetails?.[0].name}"`,
				target: `/${orgSlug}/projects/${projectId}/tasklists/${taskDetails?.[0].taskListId}`,
				fromUser: userId,
				toUser: taskDetails?.[0].assignedToUser!,
			})
			.execute();

		await broadcastEvent("notifications", taskDetails?.[0].assignedToUser!, {
			message: `You have been assigned to task "${taskDetails?.[0].name}"`,
		});
	}

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function deleteTask({
	id,
	projectId,
}: {
	id: number;
	projectId: number;
}) {
	const { orgSlug } = await getOwner();
	const db = await database();
	const taskDetails = await db
		.delete(task)
		.where(eq(task.id, +id))
		.returning({ name: task.name })
		.execute();

	await logActivity({
		action: "deleted",
		type: "task",
		message: `Deleted task ${taskDetails?.[0].name}`,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function repositionTask(
	id: number,
	projectId: number,
	position: number,
) {
	const { orgSlug } = await getOwner();
	const db = await database();
	const taskDetails = await db
		.update(task)
		.set({
			position,
			updatedAt: new Date(),
		})
		.where(eq(task.id, +id))
		.returning({ name: task.name })
		.execute();

	await logActivity({
		action: "updated",
		type: "task",
		message: `Repositioned task \`${taskDetails?.[0].name}\``,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function forkTaskList(taskListId: number, projectId: number) {
	const { orgSlug, ownerId } = await getOwner();
	const db = await database();

	const taskListDetails = await db.query.taskList
		.findFirst({
			where: eq(taskList.id, +taskListId),
		})
		.execute();
	if (!taskListDetails) {
		throw new Error("Task list not found");
	}

	db.update(taskList)
		.set({
			status: "archived",
			updatedAt: new Date(),
		})
		.where(eq(taskList.id, +taskListId))
		.execute();

	const newTaskList = await db
		.insert(taskList)
		.values({
			name: taskListDetails.name,
			description: taskListDetails.description,
			dueDate: taskListDetails.dueDate,
			status: "active",
			projectId: taskListDetails.projectId,
			createdByUser: taskListDetails.createdByUser,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning({ id: taskList.id })
		.execute();

	db.update(task)
		.set({
			taskListId: newTaskList?.[0].id,
			updatedAt: new Date(),
		})
		.where(and(eq(task.taskListId, +taskListId), eq(task.status, "todo")))
		.execute();

	await logActivity({
		action: "updated",
		type: "tasklist",
		message: `Forked task list ${taskListDetails.name}`,
		projectId: +projectId,
	});

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function getActiveTaskLists(projectId: number) {
	const db = await database();
	return db.query.taskList
		.findMany({
			where: and(
				eq(taskList.projectId, projectId),
				eq(taskList.status, "active"),
			),
		})
		.execute();
}

export async function copyTaskToTaskList(
	taskId: number,
	taskListId: number,
	projectId: number,
) {
	const { userId, orgSlug } = await getOwner();
	const db = await database();

	const taskDetails = await db.query.task
		.findFirst({
			where: eq(task.id, taskId),
		})
		.execute();

	if (!taskDetails) {
		throw new Error("Task not found");
	}

	const lastPosition = await db.query.task
		.findFirst({
			where: eq(task.taskListId, +taskListId),
			orderBy: [desc(task.position)],
		})
		.execute();

	const position = lastPosition?.position
		? lastPosition?.position + POSITION_INCREMENT
		: 1;

	await db
		.insert(task)
		.values({
			name: taskDetails.name,
			description: taskDetails.description,
			dueDate: taskDetails.dueDate,
			status: "todo",
			taskListId: +taskListId,
			position,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.execute();

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}

export async function moveTaskToTaskList(
	taskId: number,
	taskListId: number,
	projectId: number,
) {
	const { orgSlug } = await getOwner();
	const db = await database();

	await db
		.update(task)
		.set({
			taskListId: +taskListId,
			updatedAt: new Date(),
		})
		.where(eq(task.id, taskId))
		.execute();

	revalidatePath(`/${orgSlug}/projects/${projectId}/tasklists`);
}
