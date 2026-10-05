"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/auth/admin";

export async function requireAdminAction() {
  const jar = await cookies();
  const token = jar.get(getAdminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }
}
