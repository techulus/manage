import { auth } from "@/auth";
import { user } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import { opsDb } from "./database";
import { users } from "./schema";

export async function reportLastActive() {
  const { userId } = await getOwner();

  const admin = opsDb();
  await admin
    .update(users)
    .set({
      lastActiveAt: new Date(),
    })
    .where(eq(users.id, userId))
    .run();
}

export async function addUserToTenantDb() {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("User not found");
  }

  const db = await database();
  await db
    .insert(user)
    .values({
      id: session.user.id!,
      email: session.user.email!,
      rawData: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .run();
}
