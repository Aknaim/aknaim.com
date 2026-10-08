"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteData } from "@/lib/data";
import { db } from "@/lib/db";
import { destinations, recipes } from "@/lib/db/schema";
import { requireAdminAction } from "./require-admin";

const STATIC_PUBLIC_PATHS = [
  "/",
  "/climbing",
  "/gallery/climbing",
  "/travel",
  "/gallery/travel",
  "/cooking",
  "/gallery/cooking",
  "/photography",
  "/carpentry",
  "/chess",
  "/video-games",
] as const;

/** Bust R2/long-lived ISR for every public surface that can go stale. */
export async function refreshAllPublicPages() {
  await requireAdminAction();

  for (const path of STATIC_PUBLIC_PATHS) {
    revalidatePath(path);
  }

  for (const interest of siteData.interests) {
    revalidatePath(`/interests/${interest.id}`);
  }

  const [tripRows, recipeRows] = await Promise.all([
    db.select({ id: destinations.id }).from(destinations),
    db.select({ slug: recipes.slug }).from(recipes),
  ]);

  for (const row of tripRows) {
    revalidatePath(`/travel/${row.id}`);
  }
  for (const row of recipeRows) {
    revalidatePath(`/cooking/${row.slug}`);
  }

  redirect("/admin?refreshed=1");
}
