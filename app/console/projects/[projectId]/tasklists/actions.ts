"use server";

import { db } from "@/drizzle/db";
import { task, taskList } from "@/drizzle/schema";
import { getOwner } from "@/lib/utils/useOwner";
import { desc, eq } from "drizzle-orm";
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
  const { userId } = getOwner();
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

  await db
    .insert(taskList)
    .values({
      ...data,
      projectId: Number(projectId),
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();

  revalidatePath(`/console/projects/${projectId}/tasklists`);
  redirect(`/console/projects/${projectId}/tasklists`);
}

export async function updateTaskList(payload: FormData) {
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

  await db
    .update(taskList)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(taskList.id, Number(id)))
    .run();

  revalidatePath(`/console/projects/${projectId}/tasklists`);
  redirect(`/console/projects/${projectId}/tasklists`);
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
  const data = taskSchema.parse({
    name,
    description,
    dueDate,
    status: "todo",
  });

  const lastPosition = await db.query.task
    .findFirst({
      where: eq(task.taskListId, Number(taskListId)),
      orderBy: [desc(task.position)],
    })
    .execute();

  const position = lastPosition?.position
    ? lastPosition?.position + POSITION_INCREMENT
    : 1;

  await db
    .insert(task)
    .values({
      ...data,
      position,
      taskListId: Number(taskListId),
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}

export async function updateTask({
  id,
  status,
  projectId,
}: {
  id: number;
  status: string;
  projectId: number;
}) {
  await db
    .update(task)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(task.id, Number(id)))
    .run();

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}

export async function deleteTask({
  id,
  projectId,
}: {
  id: number;
  projectId: number;
}) {
  await db
    .delete(task)
    .where(eq(task.id, Number(id)))
    .run();

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}
