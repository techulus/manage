import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { reportLastActive } from "@/ops/user";
import { redirect } from "next/navigation";

export default async function Start() {
  const ready = await isDatabaseReady();

  if (!ready) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    redirect("/console/start");
  }

  await reportLastActive();
  redirect("/console/projects");
}
