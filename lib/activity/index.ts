import { activity } from "@/drizzle/schema";
import { database } from "../utils/useDatabase";

export async function logActivity({
  type,
  message,
  parentId,
  projectId,
  userId,
}: {
  type: "view" | "create" | "update" | "delete";
  message?: string;
  parentId: number;
  projectId: number;
  userId: string;
}) {
  const db = database();
  await db
    .insert(activity)
    .values({
      type,
      message,
      parentId,
      projectId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
}
