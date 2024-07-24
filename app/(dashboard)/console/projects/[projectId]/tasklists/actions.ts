"use server";

import { task, taskList } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { database } from "@/lib/utils/useDatabase";
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
  const { userId } = await getOwner();
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
  const newTaskList = await db
    .insert(taskList)
    .values({
      ...data,
      projectId: +projectId,
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
    .get();

  await logActivity({
    action: "created",
    type: "tasklist",
    message: `Created task list ${name}`,
    parentId: newTaskList.id,
    projectId: +projectId,
  });

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

  const db = await database();
  const currentTasklist = await db.query.taskList
    .findFirst({
      where: eq(taskList.id, +id),
    })
    .execute();

  await db
    .update(taskList)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(taskList.id, +id))
    .run();

  await logActivity({
    action: "updated",
    type: "tasklist",
    message: `Updated task list ${name}, ${generateObjectDiffMessage(
      currentTasklist,
      data
    )}`,
    parentId: +id,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
  redirect(`/console/projects/${projectId}/tasklists`);
}

export async function partialUpdateTaskList(
  id: number,
  data: { description: string } | { status: string }
) {
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
      updatedAt: new Date(),
    })
    .where(eq(taskList.id, +id))
    .returning()
    .get();

  await logActivity({
    action: "updated",
    type: "tasklist",
    message: `Updated task list ${updated.name}, ${generateObjectDiffMessage(
      currentTasklist,
      updated
    )}`,
    parentId: +id,
    projectId: +updated.projectId,
  });

  revalidatePath(`/console/projects/${updated.projectId}/tasklists`);
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

  await db
    .insert(task)
    .values({
      ...data,
      position,
      taskListId: +taskListId,
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();

  await logActivity({
    action: "created",
    type: "task",
    message: `Created task ${name}`,
    parentId: +taskListId,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
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
    | { dueDate: Date | null }
) {
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
    .returning()
    .get();

  await logActivity({
    action: "updated",
    type: "task",
    message: `Updated task ${taskDetails.name}, ${generateObjectDiffMessage(
      currentTask,
      taskDetails
    )}`,
    parentId: +id,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}

export async function deleteTask({
  id,
  projectId,
}: {
  id: number;
  projectId: number;
}) {
  const db = await database();
  const taskDetails = await db
    .delete(task)
    .where(eq(task.id, +id))
    .returning()
    .get();

  await logActivity({
    action: "deleted",
    type: "task",
    message: `Deleted task ${taskDetails?.name}`,
    parentId: +id,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}

export async function repositionTask(
  id: number,
  projectId: number,
  position: number
) {
  const db = await database();
  const taskDetails = await db
    .update(task)
    .set({
      position,
      updatedAt: new Date(),
    })
    .where(eq(task.id, +id))
    .returning()
    .get();

  await logActivity({
    action: "updated",
    type: "task",
    message: `Repositioned task ${taskDetails.name}`,
    parentId: +id,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}
