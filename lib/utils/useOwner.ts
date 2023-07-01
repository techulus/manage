import { auth } from "@clerk/nextjs";

export function getOwner() {
  const { userId, orgId } = auth();
  return orgId ?? userId ?? "";
}
