import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const POST = async (request: NextRequest) => {
	try {
		const resend = new Resend(process.env.RESEND_API_KEY);
		const payload = await request.text();

		resend.webhooks.verify({
			payload,
			headers: {
				id: request.headers.get("svix-id")!,
				timestamp: request.headers.get("svix-timestamp")!,
				signature: request.headers.get("svix-signature")!,
			},
			webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
		});

		const event = await request.json();

		if (event.type === "email.received") {
			console.log("Inbound email received:", event.data);
			return NextResponse.json({ received: true });
		}

		return NextResponse.json({});
	} catch {
		return new NextResponse("Invalid webhook", { status: 400 });
	}
};
