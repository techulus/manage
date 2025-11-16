import { createTurboWireHub } from "@turbowire/serverless";
import { realtimeSchema } from "@/data/notification";

export async function getSignedWireUrl(room: string, userId: string) {
  const turbowire = createTurboWireHub(process.env.TURBOWIRE_DOMAIN!, {
    schema: realtimeSchema,
  });
  return turbowire.getSignedWire(`${room}/${userId}`);
}

export async function broadcastEvent(
  room: string,
  userId: string,
  content: string | null = null,
) {
  const turbowire = createTurboWireHub(process.env.TURBOWIRE_DOMAIN!, {
    schema: realtimeSchema,
  });
  await turbowire.broadcast(`${room}/${userId}`).notification({ content });
}
