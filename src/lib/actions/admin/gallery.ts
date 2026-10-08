"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { galleryItems } from "@/lib/db/schema";
import { ensureMediaAssetId } from "./ensure-media-asset";
import { requireAdminAction } from "./require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFilters(raw: string): Record<string, string> {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[key] = value;
      else if (value != null) out[key] = String(value);
    }
    return out;
  } catch {
    throw new Error("Filters must be valid JSON object of string values.");
  }
}

export async function createOrUpdateGalleryItem(formData: FormData) {
  await requireAdminAction();

  const idInput = String(formData.get("id") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim() as
    | "travel"
    | "climbing"
    | "cooking";
  const title = String(formData.get("title") ?? "").trim() || null;
  const dateTaken = String(formData.get("dateTaken") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const mediaAssetIdInput = String(formData.get("mediaAssetId") ?? "").trim();
  const recipeSlug = String(formData.get("recipeSlug") ?? "").trim() || null;
  const durationLabel = String(formData.get("durationLabel") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const published = String(formData.get("published") ?? "true") === "true";
  const filters = parseFilters(String(formData.get("filtersJson") ?? "{}"));

  if (!interest || !dateTaken || (!mediaUrl && !mediaAssetIdInput)) {
    throw new Error("Interest, date, and media are required.");
  }

  const id = idInput || `${interest}-${slugify(title || mediaUrl)}-${dateTaken}`;
  const mediaAssetId =
    mediaAssetIdInput ||
    (await ensureMediaAssetId(
      mediaUrl,
      title ?? undefined,
      mediaUrl.match(/\.(mp4|webm)$/i) ? "video" : "image"
    ));

  await db
    .insert(galleryItems)
    .values({
      id,
      interest,
      mediaAssetId,
      title,
      dateTaken,
      filters,
      recipeSlug,
      durationLabel,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      published,
    })
    .onConflictDoUpdate({
      target: galleryItems.id,
      set: {
        interest,
        mediaAssetId,
        title,
        dateTaken,
        filters,
        recipeSlug,
        durationLabel,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        published,
      },
    });

  revalidatePath(`/gallery/${interest}`);
  if (interest === "climbing") revalidatePath("/climbing");
  revalidatePath("/admin/gallery");
  redirect(`/admin/gallery/${id}`);
}

export async function deleteGalleryItem(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const [row] = await db
    .select({ interest: galleryItems.interest })
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);

  await db.delete(galleryItems).where(eq(galleryItems.id, id));

  if (row) {
    revalidatePath(`/gallery/${row.interest}`);
    if (row.interest === "climbing") revalidatePath("/climbing");
  }
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
