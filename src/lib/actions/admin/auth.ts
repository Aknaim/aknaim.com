"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth/admin";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!verifyAdminPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const jar = await cookies();
  jar.set(getAdminCookieName(), createAdminSessionToken(), getAdminCookieOptions());
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(getAdminCookieName());
  redirect("/admin/login");
}
