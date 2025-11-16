import z from "zod";

export const realtimeSchema = {
  notification: z.object({ content: z.string().nullable() }),
};
