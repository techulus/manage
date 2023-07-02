import { prisma } from "@/lib/utils/db";
import { Webhook, WebhookRequiredHeaders } from "svix";

const webhookSecret = process.env.AUTH_WEBHOOK_SECRET;

enum MessageTypes {
  "user.created" = "user.created",
  "user.updated" = "user.updated",
  "user.deleted" = "user.deleted",
}

type Message = {
  object: string;
  type: MessageTypes;
  data: any;
};

export async function POST(request: Request) {
  const wh = new Webhook(webhookSecret as string);
  const headers: WebhookRequiredHeaders = {
    "svix-id": request.headers.get("svix-id") as string,
    "svix-signature": request.headers.get("svix-signature") as string,
    "svix-timestamp": request.headers.get("svix-timestamp") as string,
  };

  const body = await request.text();

  let msg: Message;
  try {
    msg = wh.verify(body, headers) as unknown as Message;
    // console.log("POST /webhooks/auth Message:", msg);

    const data = msg.data;

    switch (msg.type) {
      case "user.created":
        await prisma.user.create({
          data: {
            id: data.id,
            email: data.email_addresses[0].email_address,
            first_name: data.first_name,
            last_name: data.last_name,
            rawData: data,
          },
        });
        break;
      case "user.updated":
        await prisma.user.update({
          where: {
            id: data.id,
          },
          data: {
            email: data.email_addresses[0].email_address,
            first_name: data.first_name,
            last_name: data.last_name,
            rawData: data,
          },
        });
        break;
      default:
        throw new Error("Invalid message type");
    }

    return new Response("OK");
  } catch (err) {
    console.log("POST /webhooks/auth Error:", err);
    new Response("Invalid signature", { status: 401 });
  }
}
