"use server";

import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

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
    .transform((val) => (val?.trim()?.length ? val : null)),
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
    .transform((val) => (val?.trim()?.length ? val : null)),
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
  console.log("data", data);

  await prisma.taskList.create({
    data: {
      ...data,
      createdBy: {
        connect: {
          id: userId,
        },
      },
      project: {
        connect: {
          id: Number(projectId),
        },
      },
    },
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
  redirect(`/console/projects/${projectId}/tasklists`);
}

export async function createTask({
  userId,
  taskListId,
  projectId,
  name,
  description = "",
  dueDate,
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

  await prisma.task.create({
    data: {
      ...data,
      createdBy: {
        connect: {
          id: userId,
        },
      },
      taskList: {
        connect: {
          id: taskListId,
        },
      },
    },
  });

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
  await prisma.task.update({
    where: {
      id: Number(id),
    },
    data: {
      status,
    },
  });

  revalidatePath(`/console/projects/${projectId}/tasklists`);
}
