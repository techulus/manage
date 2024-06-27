import { User } from "@/drizzle/types";
import { auth } from "@clerk/nextjs/server";
import { database } from "./useDatabase";

type Result = {
  ownerId: string;
  userId: string;
  orgId: string;
};

export function getOwner(): Result {
  const { userId, orgId } = auth();
  return { ownerId: orgId ?? userId ?? "", userId, orgId } as Result;
}

export async function allUser(): Promise<User[]> {
  const { userId } = auth();
  const users: User[] = (await database().query.user.findMany()) ?? [];
  return users.filter((user) => user.id !== userId);
}
