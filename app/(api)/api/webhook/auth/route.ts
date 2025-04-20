import { deleteDatabase } from "@/lib/utils/useDatabase";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

enum WebhookEventType {
	organizationCreated = "organization.created",
	organizationDeleted = "organization.deleted",
	organizationUpdated = "organization.updated",
	userCreated = "user.created",
	userDeleted = "user.deleted",
	userUpdated = "user.updated",
}

export async function POST(req: Request) {
	try {
		const evt = await verifyWebhook(req);

		const { id } = evt.data;
		const eventType = evt.type;
		console.log("Webhook payload:", id, evt.data);

		if (!id) {
			console.error("Webhook received with no ID");
			return new Response("Webhook received with no ID", { status: 400 });
		}

		switch (eventType) {
			case WebhookEventType.userDeleted:
			case WebhookEventType.organizationDeleted:
				try {
					await deleteDatabase(id);
					console.log("Database deleted successfully");
				} catch (err) {
					console.error("Error deleting database:", err);
				}
				break;
			default:
				console.log("Unhandled webhook event type:", eventType);
				break;
		}

		return new Response("ok", { status: 200 });
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error verifying webhook", { status: 400 });
	}
}
