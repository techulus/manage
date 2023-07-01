import { Webhook, WebhookRequiredHeaders } from "svix";

const webhookSecret = process.env.AUTH_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.json();

  const wh = new Webhook(webhookSecret as string);
  const headers: WebhookRequiredHeaders = {
    "svix-id": request.headers.get("svix-id") as string,
    "svix-signature": request.headers.get("svix-signature") as string,
    "svix-timestamp": request.headers.get("svix-timestamp") as string,
  };

  let msg;
  try {
    msg = wh.verify(body, headers);
    console.log("POST /webhooks/auth Message:", msg);
    return new Response("OK");
  } catch (err) {
    console.log("POST /webhooks/auth Error:", err);
    new Response("Invalid signature", { status: 401 });
  }
}
