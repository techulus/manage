"use server";

import { prisma } from "@/lib/utils/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

export async function createProject(payload: FormData) {
  const { userId, orgId } = auth();

  const name = payload.get("name") as string;
  const description = payload.get("description") as string;

  await prisma.project.create({
    data: {
      name,
      description,
      ownerId: orgId || userId || "",
      status: "active",
    },
  });

  revalidatePath("/console/projects");
  redirect("/console/projects");
}
