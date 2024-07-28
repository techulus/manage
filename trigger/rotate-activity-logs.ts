import { getDatabaseForOwner } from "@/lib/utils/turso";
import { task } from "@trigger.dev/sdk/v3";
import dayjs from "dayjs";
import { lte } from "drizzle-orm";
import { activity } from "../drizzle/schema";

export const rotateActivityLogs = task({
  id: "rotate-activity-logs",
  retry: {
    maxAttempts: 3,
  },
  run: async ({ ownerId }: { ownerId: string }) => {
    const db = getDatabaseForOwner(ownerId);

    return await db
      .delete(activity)
      .where(lte(activity.createdAt, dayjs().subtract(90, "days").toDate()));
  },
});
