"use server";

import { signIn, signOut } from "@/auth";
import { getOwner } from "@/lib/utils/useOwner";
import { opsDb } from "@/ops/database";
import { users } from "@/ops/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  await signIn("resend", formData);
}

export async function switchOrganization(payload: FormData) {
  const orgId = payload.get("id") as string;

  if (orgId) {
    cookies().set("activeOrgId", orgId ?? null, {
      httpOnly: true,
    });
  } else {
    cookies().delete("activeOrgId");
  }

  redirect("/console/projects");
}

export async function logout() {
  cookies().delete("activeOrgId");
  await signOut();
  redirect("/");
}

export async function saveUserTimezone(timezone: string) {
  const { userId } = await getOwner();

  await opsDb()
    .update(users)
    .set({
      timezone,
    })
    .where(eq(users.id, userId));

  cookies().set("userTimezone", timezone, {
    httpOnly: true,
  });
}
