import { Webhook, WebhookRequiredHeaders } from "svix";

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.AUTH_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.json();

  const wh = new Webhook(webhookSecret as string);
  let msg;
  try {
    msg = wh.verify(body, request.headers as unknown as WebhookRequiredHeaders);
  } catch (err) {
    new Response("Invalid signature", { status: 401 });
  }

  console.log("POST /webhooks/auth", msg);

  return new Response("OK");
}
