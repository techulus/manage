import { notification } from "@/drizzle/schema";
import { broadcastEvent } from "./turbowire";
import { database } from "./useDatabase";

export async function notifyUser(
  userId: string,
  message: string | null = null,
  options: {
    type: "task" | "project" | "event" | "comment" | "mention" | null;
    target: string | null;
    fromUser: string | null;
  } = { type: null, target: null, fromUser: null },
) {
  if (!userId) return;

  const db = await database();

  if (message) {
    await Promise.all([
      db
        .insert(notification)
        .values({ ...options, toUser: userId, message })
        .execute(),
      broadcastEvent("notifications", userId, message),
    ]);
  } else {
    await broadcastEvent("notifications", userId);
  }
}
