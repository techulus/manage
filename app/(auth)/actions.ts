"use server";

import { signIn, signOut } from "@/auth";
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
