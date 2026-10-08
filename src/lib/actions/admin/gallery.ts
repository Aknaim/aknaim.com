"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildFiltersFromForm,
  isGalleryInterest,
} from "@/lib/admin/gallery-form";
import { db } from "@/lib/db";
import { galleryItems } from "@/lib/db/schema";
import type { GalleryInterest } from "@/lib/types/gallery";
import { ensureMediaAssetId } from "./ensure-media-asset";
import { requireAdminAction } from "./require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readFilterValue(formData: FormData, key: string): string {
  return String(formData.get(`filter_${key}`) ?? "").trim();
}

function filtersFromFormData(interest: GalleryInterest, formData: FormData, dateTaken: string) {
  return buildFiltersFromForm(interest, (key) => readFilterValue(formData, key), dateTaken);
}

function revalidateGallery(interest: GalleryInterest) {
  revalidatePath(`/gallery/${interest}`);
  if (interest === "climbing") revalidatePath("/climbing");
  if (interest === "cooking") {
    revalidatePath("/cooking");
    revalidatePath("/admin/recipes");
  }
  if (interest === "travel") revalidatePath("/travel");
  revalidatePath("/admin/gallery");
}

function safeReturnTo(raw: string, fallback: string): string {
  if (raw.startsWith("/admin/")) return raw;
  return fallback;
}

export async function createOrUpdateGalleryItem(formData: FormData) {
  await requireAdminAction();

  const idInput = String(formData.get("id") ?? "").trim();
  const interestRaw = String(formData.get("interest") ?? "").trim();
  if (!isGalleryInterest(interestRaw)) {
    throw new Error("Interest is required.");
  }
  const interest = interestRaw;
  const title = String(formData.get("title") ?? "").trim() || null;
  const dateTaken = String(formData.get("dateTaken") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const mediaAssetIdInput = String(formData.get("mediaAssetId") ?? "").trim();
  const recipeSlug =
    interest === "cooking"
      ? String(formData.get("recipeSlug") ?? "").trim() || null
      : null;
  const durationLabel =
    interest === "climbing"
      ? String(formData.get("durationLabel") ?? "").trim() || null
      : null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const published = String(formData.get("published") ?? "true") === "true";
  const filters = filtersFromFormData(interest, formData, dateTaken);

  if (!dateTaken || (!mediaUrl && !mediaAssetIdInput)) {
    throw new Error("Date and media are required.");
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

  revalidateGallery(interest);
  const returnTo = safeReturnTo(
    String(formData.get("returnTo") ?? "").trim(),
    interest === "cooking" ? "/admin/recipes" : `/admin/gallery/${id}`
  );
  redirect(returnTo);
}

export type GalleryBatchItemInput = {
  mediaUrl: string;
  mediaAssetId?: string;
  title?: string;
  /** Per-item date; falls back to batch defaultDateTaken, then today. */
  dateTaken?: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createGalleryItemsBatch(input: {
  interest: GalleryInterest;
  /** Optional shared fallback when an item omits dateTaken. */
  defaultDateTaken?: string;
  filters: Record<string, string>;
  recipeSlug?: string | null;
  durationLabel?: string | null;
  sortOrder?: number;
  published?: boolean;
  items: GalleryBatchItemInput[];
}): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  await requireAdminAction();

  if (!isGalleryInterest(input.interest)) {
    return { ok: false, error: "Invalid interest." };
  }
  if (!input.items.length) {
    return { ok: false, error: "Add at least one image." };
  }

  const interest = input.interest;
  const fallbackDate =
    input.defaultDateTaken?.trim() || todayIsoDate();
  const published = input.published !== false;
  const baseSort = Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0;
  const recipeSlug =
    interest === "cooking" ? input.recipeSlug?.trim() || null : null;
  const durationLabel =
    interest === "climbing" ? input.durationLabel?.trim() || null : null;

  for (const [index, item] of input.items.entries()) {
    const mediaUrl = item.mediaUrl.trim();
    if (!mediaUrl && !item.mediaAssetId) {
      return { ok: false, error: `Item ${index + 1} is missing media.` };
    }

    const dateTaken = item.dateTaken?.trim() || fallbackDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTaken)) {
      return { ok: false, error: `Item ${index + 1} needs a valid date (YYYY-MM-DD).` };
    }

    const filters = { ...input.filters };
    if (interest === "travel") {
      filters.year = dateTaken.slice(0, 4);
    }

    const title = item.title?.trim() || null;
    const mediaAssetId =
      item.mediaAssetId?.trim() ||
      (await ensureMediaAssetId(
        mediaUrl,
        title ?? undefined,
        mediaUrl.match(/\.(mp4|webm)$/i) ? "video" : "image"
      ));

    const idBase = slugify(title || mediaUrl) || `photo-${index + 1}`;
    const unique = `${Date.now().toString(36)}${index.toString(36)}`;
    const id = `${interest}-${idBase}-${dateTaken}-${unique}`;

    await db.insert(galleryItems).values({
      id,
      interest,
      mediaAssetId,
      title,
      dateTaken,
      filters,
      recipeSlug,
      durationLabel,
      sortOrder: baseSort + index,
      published,
    });
  }

  revalidateGallery(interest);
  return { ok: true, count: input.items.length };
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
    revalidateGallery(row.interest);
  } else {
    revalidatePath("/admin/gallery");
  }

  const returnTo = safeReturnTo(
    String(formData.get("returnTo") ?? "").trim(),
    row?.interest === "cooking" ? "/admin/recipes" : "/admin/gallery"
  );
  redirect(returnTo);
}
