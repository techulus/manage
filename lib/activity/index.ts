import { activity } from "@/drizzle/schema";
import { database } from "../utils/useDatabase";
import { getOwner } from "../utils/useOwner";

export async function logActivity({
  action,
  type,
  message,
  parentId,
  projectId,
}: {
  action: "created" | "updated" | "deleted";
  type:
    | "tasklist"
    | "task"
    | "project"
    | "document"
    | "folder"
    | "event"
    | "comment";
  message: string;
  parentId: number;
  projectId: number;
}) {
  const db = database();
  const userId = getOwner().userId;
  await db
    .insert(activity)
    .values({
      action,
      type,
      message,
      parentId,
      projectId,
      userId,
      createdAt: new Date(),
    })
    .run();
}
