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
  ownerId: z.string(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]),
});

const taskSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]),
});

export async function createTaskList(payload: FormData) {
  const ownerId = getOwner();
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const projectId = payload.get("projectId") as string;

  const data = taskListSchema.parse({
    name,
    description,
    ownerId,
    status: "active",
  });

  const taskList = await prisma.taskList.create({
    data: {
      ...data,
      project: {
        connect: {
          id: Number(projectId),
        },
      },
    },
  });

  redirect(`/console/projects/${projectId}/tasklists/${taskList.id}`);
}

export async function createTask(payload: FormData) {
  const name = payload.get("name") as string;
  const description = (payload.get("description") as string) ?? "";
  const taskListId = payload.get("taskListId") as string;
  const projectId = payload.get("projectId") as string;

  const data = taskSchema.parse({
    name,
    description,
    status: "active",
  });

  await prisma.task.create({
    data: {
      ...data,
      taskList: {
        connect: {
          id: Number(taskListId),
        },
      },
    },
  });

  revalidatePath(`/console/projects/${projectId}/tasklists/${taskListId}`);
  redirect(`/console/projects/${projectId}/tasklists/${taskListId}`);
}
