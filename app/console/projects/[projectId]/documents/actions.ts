"use server";

import { prisma } from "@/lib/utils/db";
import { getOwner } from "@/lib/utils/useOwner";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

const documentSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  markdownContent: z.string(),
  status: z.enum(["active", "archived"]),
});

export async function createDocument(payload: FormData) {
  const { userId } = getOwner();
  const name = payload.get("name") as string;
  const markdownContent = payload.get("markdownContent") as string;
  const projectId = payload.get("projectId") as string;

  const data = documentSchema.parse({
    name,
    markdownContent,
    status: "active",
  });

  await prisma.document.create({
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

  revalidatePath(`/console/projects/${projectId}/documents`);
  redirect(`/console/projects/${projectId}/documents`);
}
