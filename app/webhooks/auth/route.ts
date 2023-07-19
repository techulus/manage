import { db } from "@/drizzle/db";
import { organization, user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Webhook, WebhookRequiredHeaders } from "svix";

const webhookSecret = process.env.AUTH_WEBHOOK_SECRET;

enum MessageTypes {
  // User
  "user.created" = "user.created",
  "user.updated" = "user.updated",
  // Organization
  "organization.created" = "organization.created",
  "organization.updated" = "organization.updated",
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
        await db
          .insert(user)
          .values({
            id: data.id,
            email: data.email_addresses[0].email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            rawData: data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .run();

        await db
          .insert(organization)
          .values({
            id: data.id,
            name: "Personal",
            imageUrl: data.image_url,
            logoUrl: data.logo_url,
            rawData: data,
            createdByUser: data.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .run();
        break;
      case "user.updated":
        await db
          .update(user)
          .set({
            email: data.email_addresses[0].email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            rawData: data,
            updatedAt: new Date(),
          })
          .where(eq(user.id, data.id))
          .run();
        break;

      case "organization.created":
        await db
          .insert(organization)
          .values({
            id: data.id,
            name: data.name,
            imageUrl: data.image_url,
            logoUrl: data.logo_url,
            rawData: data,
            createdByUser: data.created_by,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .run();
        break;
      case "organization.updated":
        await db
          .update(organization)
          .set({
            name: data.name,
            imageUrl: data.image_url,
            logoUrl: data.logo_url,
            rawData: data,
            updatedAt: new Date(),
          })
          .where(eq(user.id, data.id))
          .run();
      default:
        console.log("POST /webhooks/auth Unknown message type:", msg.type);
    }

    return new Response("OK");
  } catch (err) {
    console.log("POST /webhooks/auth Error:", err);
    new Response("Invalid signature", { status: 401 });
  }
}
