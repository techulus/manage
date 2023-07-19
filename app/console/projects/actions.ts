"use server";

import { db } from "@/drizzle/db";
import { project } from "@/drizzle/schema";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
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
  const { ownerId, userId } = getOwner();
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const dueDate = payload.get("dueDate") as string;

  const data = projectSchema.parse({
    name,
    description,
    dueDate,
    status: "active",
  });

  await db
    .insert(project)
    .values({
      ...data,
      organizationId: String(ownerId),
      createdByUser: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();

  revalidatePath(`/console/projects`);
  redirect(`/console/projects`);
}

export async function updateProject(payload: FormData) {
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

  await db
    .update(project)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .run();

  revalidatePath(`/console/projects/${id}`);
  redirect(`/console/projects/${id}`);
}

export async function archiveProject(payload: FormData) {
  const id = Number(payload.get("id"));

  await db
    .update(project)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .run();

  revalidatePath("/console/projects");
  redirect("/console/projects");
}

export async function deleteProject(payload: FormData) {
  const id = Number(payload.get("id"));

  await db.delete(project).where(eq(project.id, id)).run();

  revalidatePath("/console/projects");
  redirect("/console/projects");
}
