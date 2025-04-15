import { verifyWebhook } from "@clerk/nextjs/webhooks";

export async function POST(req: Request) {
	try {
		const evt = await verifyWebhook(req);

		const { id } = evt.data;
		const eventType = evt.type;
		console.log(
			`Received webhook with ID ${id} and event type of ${eventType}`,
		);
		console.log("Webhook payload:", evt.data);

		return new Response("Webhook received", { status: 200 });
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error verifying webhook", { status: 400 });
	}
}
