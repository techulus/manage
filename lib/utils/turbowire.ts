import { TurboWireHub } from "@turbowire/serverless";

export type Event = "notifications";

export async function getSignedWireUrl(room: Event, userId: string) {
	const turbowire = new TurboWireHub(process.env.TURBOWIRE_DOMAIN!);
	return turbowire.getSignedWire(`${room}/${userId}`);
}

export async function broadcastEvent(
	room: Event,
	actor: string,
	message: Record<string, string | number> | null = null,
) {
	const turbowire = new TurboWireHub(process.env.TURBOWIRE_DOMAIN!, {
		broadcastUrl: process.env.TURBOWIRE_BROADCAST_URL,
	});
	await turbowire.broadcast(`${room}/${actor}`, JSON.stringify(message));
}
