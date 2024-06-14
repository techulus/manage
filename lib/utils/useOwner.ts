import { auth } from "@clerk/nextjs/server";

type Result = {
  ownerId: string;
  userId: string;
  orgId: string;
};

export function getOwner(): Result {
  const { userId, orgId } = auth();
  return { ownerId: orgId ?? userId ?? "", userId, orgId } as Result;
}
