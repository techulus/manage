import { broadcaster, identificator } from "@anycable/serverless-js";
import { signer } from "@anycable/serverless-js";

const secret = process.env.ANYCABLE_SECRET;
const jwtTTL = "1h";

const broadcastURL = process.env.ANYCABLE_BROADCAST_URL!;
const broadcastKey = process.env.ANYCABLE_BROADCAST_KEY!;

export type Event = "notifications";

export async function getToken(userId: string) {
	if (!secret) {
		throw new Error("ANYCABLE_SECRET is not set");
	}

	const identifier = identificator(secret, jwtTTL);
	const token = await identifier.generateToken({ userId });
	return token;
}

export async function getStreamFor(room: Event, userId: string) {
	if (!secret) {
		throw new Error("ANYCABLE_STREAMS_SECRET is not set");
	}

	const sign = signer(secret);
	const signedStreamName = sign(`${room}/${userId}`);

	return signedStreamName;
}

export async function broadcastEvent(
	room: Event,
	userId: string,
	message: Record<string, string | number>,
) {
	const broadcastTo = broadcaster(broadcastURL, broadcastKey);
	await broadcastTo(`${room}/${userId}`, message);
}
