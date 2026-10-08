"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateClimbingPublicPages } from "@/lib/cache/revalidate-public";
import { db } from "@/lib/db";
import { climbingSends, galleryItems } from "@/lib/db/schema";
import { requireAdminAction } from "./require-admin";

export async function deleteClimbingSend(formData: FormData) {
  await requireAdminAction();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  await db.delete(galleryItems).where(eq(galleryItems.id, `climb-${slug}-still`));
  await db.delete(galleryItems).where(eq(galleryItems.id, `climb-${slug}-grade`));
  await db.delete(galleryItems).where(eq(galleryItems.id, `climb-${slug}-send`));
  await db.delete(climbingSends).where(eq(climbingSends.slug, slug));

  revalidatePath("/climbing");
  revalidatePath("/gallery/climbing");
  revalidatePath("/admin/climbing");
  redirect("/admin/climbing");
}

/** Bust stale ISR for the public climbing page (R2 long-lived cache). */
export async function refreshClimbingPublicPage() {
  await requireAdminAction();
  revalidateClimbingPublicPages();
  redirect("/admin/climbing?refreshed=1");
}
