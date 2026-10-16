"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import {
  clearLoginAttempts,
  consumeLoginAttempt,
  loginClientKey,
} from "@/lib/auth/login-rate-limit";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const nextParam = encodeURIComponent(next);

  const headerList = await headers();
  const clientKey = loginClientKey(headerList);

  if (consumeLoginAttempt(clientKey)) {
    redirect(`/admin/login?error=rate&next=${nextParam}`);
  }

  if (!verifyAdminPassword(password)) {
    redirect(`/admin/login?error=1&next=${nextParam}`);
  }

  clearLoginAttempts(clientKey);

  try {
    const jar = await cookies();
    jar.set(
      getAdminCookieName(),
      createAdminSessionToken(),
      getAdminCookieOptions()
    );
  } catch {
    // Misconfigured SESSION_SECRET in production — fail closed, same UX as bad password.
    redirect(`/admin/login?error=1&next=${nextParam}`);
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(getAdminCookieName());
  redirect("/admin/login");
}
