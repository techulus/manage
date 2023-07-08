import { db } from "@/drizzle/db";
import { organization, user } from "@/drizzle/schema";
import { clerkClient } from "@clerk/nextjs";

export async function GET() {
  console.log("Running route");

  const allUsers = await clerkClient.users.getUserList();
  for (const data of allUsers) {
    try {
      console.log("Trying to insert user", data.id);
      await db
        .insert(user)
        .values({
          id: data.id,
          email: data.emailAddresses[0].emailAddress,
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
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
          imageUrl: data.imageUrl,
          logoUrl: data.imageUrl,
          rawData: data,
          createdByUser: data.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();
    } catch (e) {
      console.log("Failed to insert user", data.id);
      continue;
    }
  }

  const orgs = await clerkClient.organizations.getOrganizationList();
  for (const data of orgs) {
    try {
      await db
        .insert(organization)
        .values({
          id: data.id,
          name: data.name,
          imageUrl: data.imageUrl,
          logoUrl: data.logoUrl,
          rawData: data,
          createdByUser: data.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();
    } catch (e) {
      continue;
    }
  }

  return new Response("Done");
}
