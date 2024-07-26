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
    | "blob"
    | "folder"
    | "event"
    | "comment";
  message: string;
  parentId: number;
  projectId: number;
}) {
  const db = await database();
  const { userId } = await getOwner();
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

export function generateObjectDiffMessage(original: any, updated: any) {
  const ignoreKeys = ["updatedAt", "createdAt", "repeatRule"];

  const message: string[] = [];

  for (let key in original) {
    if (ignoreKeys.includes(key)) {
      continue;
    }

    if (updated.hasOwnProperty(key)) {
      if (original[key] !== updated[key]) {
        if (updated[key] instanceof String && updated[key].length > 250) {
          message.push(`changed ${key}`);
        } else if (updated[key] instanceof Date) {
          message.push(
            `changed ${key} from ${original[key]} to ${updated[
              key
            ].toLocaleString()}`
          );
        } else if (updated[key] instanceof Boolean) {
          if (updated[key]) {
            message.push(`enabled ${key}`);
          } else {
            message.push(`disabled ${key}`);
          }
        } else if (!updated[key]) {
          message.push(`${key} removed`);
        } else {
          message.push(
            `changed ${key} from ${original[key] ?? "empty"} to ${updated[key]}`
          );
        }
      }
    }
  }

  return message.join(", ");
}
