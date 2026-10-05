"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { getMediaDriver, uploadMedia } from "@/lib/media/storage";
import { requireAdminAction } from "./require-admin";

export type UploadMediaResult =
  | { ok: true; id: string; url: string; driver: "local" | "r2" }
  | { ok: false; error: string };

function detectMediaType(contentType: string, filename: string): "image" | "video" {
  if (contentType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(filename)) {
    return "video";
  }
  return "image";
}

/**
 * Upload a file from admin FormData and insert a media_assets row.
 * Local next dev → public/media; production → R2.
 * Expected fields: `file`, optional `alt`, `folder`, `fileName`, `posterUrl`, `durationLabel`.
 */
export async function uploadMediaAsset(formData: FormData): Promise<UploadMediaResult> {
  await requireAdminAction();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  const alt = String(formData.get("alt") ?? "").trim() || null;
  const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";
  const preferredFileName = String(formData.get("fileName") ?? "").trim() || undefined;
  const posterUrl = String(formData.get("posterUrl") ?? "").trim() || null;
  const durationLabel = String(formData.get("durationLabel") ?? "").trim() || null;
  const contentType = file.type || "application/octet-stream";
  const mediaType = detectMediaType(contentType, file.name);
  const body = Buffer.from(await file.arrayBuffer());

  try {
    const uploaded = await uploadMedia({
      body,
      contentType,
      folder,
      filename: file.name,
      preferredFileName,
    });

    const existing = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.url, uploaded.url))
      .limit(1);

    if (existing[0]) {
      // Bump createdAt so gallery/lightbox cache-bust query params refresh.
      await db
        .update(mediaAssets)
        .set({
          createdAt: new Date(),
          alt: alt ?? undefined,
          posterUrl: posterUrl ?? undefined,
          durationLabel: durationLabel ?? undefined,
        })
        .where(eq(mediaAssets.id, existing[0].id));
      revalidatePath("/admin/media");
      revalidatePath("/gallery/climbing");
      return {
        ok: true,
        id: existing[0].id,
        url: uploaded.url,
        driver: uploaded.driver,
      };
    }

    const [row] = await db
      .insert(mediaAssets)
      .values({
        url: uploaded.url,
        alt,
        mediaType,
        posterUrl,
        durationLabel,
      })
      .returning();

    revalidatePath("/admin/media");
    return { ok: true, id: row.id, url: row.url, driver: uploaded.driver };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return { ok: false, error: message };
  }
}

/** Ensure a media_assets row exists for a URL (paste path or existing R2 URL). */
export async function ensureMediaAssetId(
  url: string,
  alt?: string,
  mediaType: "image" | "video" = "image"
): Promise<string> {
  const existing = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.url, url))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(mediaAssets)
    .values({ url, alt: alt ?? null, mediaType })
    .returning();
  return row.id;
}

export async function getAdminMediaDriver() {
  await requireAdminAction();
  return getMediaDriver();
}
