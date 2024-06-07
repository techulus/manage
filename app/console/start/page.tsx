import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { redirect } from "next/navigation";

export default async function Start() {
  const { ownerId } = getOwner();
  const ready = await isDatabaseReady(ownerId);

  if (!ready) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    redirect("/console/start");
  }

  redirect("/console/projects");
}
