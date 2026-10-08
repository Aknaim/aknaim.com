"use server";

import { redirect } from "next/navigation";
import { revalidatePublicSite } from "@/lib/cache/revalidate-public";
import { requireAdminAction } from "./require-admin";

/** Bust R2/long-lived ISR for every public surface that can go stale. */
export async function refreshAllPublicPages() {
  await requireAdminAction();
  await revalidatePublicSite();
  redirect("/admin?refreshed=1");
}
