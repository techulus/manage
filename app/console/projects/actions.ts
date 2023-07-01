"use server";

import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  ownerId: z.string(),
  status: z.enum(["active", "archived"]),
});

export async function createProject(payload: FormData) {
  const ownerId = getOwner();
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;

  const data = projectSchema.parse({
    name,
    description,
    ownerId,
    status: "active",
  });

  await prisma.project.create({
    data,
  });

  revalidatePath("/console/projects");
  redirect("/console/projects");
}

export async function updateProject(payload: FormData) {
  const ownerId = getOwner();
  const id = Number(payload.get("id"));
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;

  const data = projectSchema.parse({
    name,
    description,
    ownerId,
    status: "active",
  });

  await prisma.project.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/console/projects");
  redirect("/console/projects");
}

export async function archiveProject(payload: FormData) {
  const id = Number(payload.get("id"));

  await prisma.project.update({
    where: {
      id,
    },
    data: {
      status: "archived",
    },
  });

  revalidatePath("/console/projects");
  redirect("/console/projects");
}
