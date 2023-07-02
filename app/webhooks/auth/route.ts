import { prisma } from "@/lib/utils/db";
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
        await prisma.$transaction([
          prisma.user.create({
            data: {
              id: data.id,
              email: data.email_addresses[0].email_address,
              first_name: data.first_name,
              last_name: data.last_name,
              rawData: data,
            },
          }),
          // Create a personal organization for the user
          prisma.organization.create({
            data: {
              id: data.id,
              name: "Personal",
              image_url: data.image_url,
              logo_url: data.image_url,
              rawData: data,
              createdBy: {
                connect: {
                  id: data.id,
                },
              },
            },
          }),
        ]);
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

      case "organization.created":
        await prisma.organization.create({
          data: {
            id: data.id,
            name: data.name,
            image_url: data.image_url,
            logo_url: data.logo_url,
            rawData: data,
            createdBy: {
              connect: {
                id: data.created_by,
              },
            },
          },
        });
        break;
      case "organization.updated":
        await prisma.organization.update({
          where: {
            id: data.id,
          },
          data: {
            name: data.name,
            image_url: data.image_url,
            logo_url: data.logo_url,
            rawData: data,
            createdBy: {
              connect: {
                id: data.created_by,
              },
            },
          },
        });
      default:
        console.log("POST /webhooks/auth Unknown message type:", msg.type);
    }

    return new Response("OK");
  } catch (err) {
    console.log("POST /webhooks/auth Error:", err);
    new Response("Invalid signature", { status: 401 });
  }
}
