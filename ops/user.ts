import { currentUser } from "@clerk/nextjs/dist/types/server";
import { opsDb } from "./database";
import { _user } from "./schema";

export async function reportLastActive() {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const admin = opsDb();
  await admin
    .insert(_user)
    .values({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: _user.id,
      set: {
        email: user.emailAddresses[0].emailAddress,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      },
    });
}
