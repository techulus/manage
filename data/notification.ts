import type { EventPayload } from "@turbowire/serverless";
import z from "zod";

export const realtimeSchema = {
  notification: z.object({ content: z.string().nullable() }),
};

export type NotificationPayload = EventPayload<
  typeof realtimeSchema,
  "notification"
>;
