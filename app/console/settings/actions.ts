"use server";

import { cookies } from "next/headers";

export async function updateTheme(formData: FormData) {
  const theme = String(formData.get("theme")) ?? "light";

  cookies().set("theme", theme, { httpOnly: true });
}
