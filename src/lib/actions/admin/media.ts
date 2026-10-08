"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { requireAdminAction } from "./require-admin";

export type UploadMediaResult =
  | { ok: true; id: string; url: string; driver: "local" | "r2" }
  | { ok: false; error: string };

export type PrepareUploadResult =
  | {
      ok: true;
      mode: "r2-direct";
      uploadUrl: string;
      publicUrl: string;
      contentType: string;
    }
  | { ok: true; mode: "server" }
  | { ok: false; error: string };

function detectMediaType(contentType: string, filename: string): "image" | "video" {
  if (contentType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(filename)) {
    return "video";
  }
  return "image";
}

async function upsertMediaAsset(input: {
  url: string;
  alt: string | null;
  mediaType: "image" | "video";
  posterUrl?: string | null;
  durationLabel?: string | null;
  driver: "local" | "r2";
}): Promise<UploadMediaResult> {
  const existing = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.url, input.url))
    .limit(1);

  if (existing[0]) {
    await db
      .update(mediaAssets)
      .set({
        createdAt: new Date(),
        alt: input.alt ?? undefined,
        posterUrl: input.posterUrl ?? undefined,
        durationLabel: input.durationLabel ?? undefined,
      })
      .where(eq(mediaAssets.id, existing[0].id));
    revalidatePath("/admin/media");
    revalidatePath("/gallery/climbing");
    revalidatePath("/climbing");
    return {
      ok: true,
      id: existing[0].id,
      url: input.url,
      driver: input.driver,
    };
  }

  const [row] = await db
    .insert(mediaAssets)
    .values({
      url: input.url,
      alt: input.alt,
      mediaType: input.mediaType,
      posterUrl: input.posterUrl ?? null,
      durationLabel: input.durationLabel ?? null,
    })
    .returning();

  revalidatePath("/admin/media");
  revalidatePath("/climbing");
  return { ok: true, id: row.id, url: row.url, driver: input.driver };
}

/**
 * Ask the server how to upload. Production R2 uses a browser→R2 presigned PUT
 * so large videos never traverse the Worker.
 */
export async function prepareMediaUpload(formData: FormData): Promise<PrepareUploadResult> {
  await requireAdminAction();

  const { getMediaDriver, isR2Configured } = await import("@/lib/media/driver");
  const driver = getMediaDriver();
  if (driver !== "r2" || !isR2Configured()) {
    return { ok: true, mode: "server" };
  }

  const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";
  const preferredFileName = String(formData.get("fileName") ?? "").trim() || undefined;
  const filename = String(formData.get("filename") ?? "").trim() || preferredFileName || "file";
  const contentType =
    String(formData.get("contentType") ?? "").trim() || "application/octet-stream";

  try {
    const { presignR2Put } = await import("@/lib/media/r2");
    const signed = await presignR2Put({
      contentType,
      folder,
      filename,
      preferredFileName,
    });
    return {
      ok: true,
      mode: "r2-direct",
      uploadUrl: signed.uploadUrl,
      publicUrl: signed.publicUrl,
      contentType: signed.contentType,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not prepare upload.";
    return { ok: false, error: message };
  }
}

/** After a successful browser→R2 PUT, register the public URL in Postgres. */
export async function finalizeMediaUpload(formData: FormData): Promise<UploadMediaResult> {
  await requireAdminAction();

  const url = String(formData.get("url") ?? "").trim();
  if (!url.startsWith("https://")) {
    return { ok: false, error: "Expected an https media URL after direct upload." };
  }

  const alt = String(formData.get("alt") ?? "").trim() || null;
  const posterUrl = String(formData.get("posterUrl") ?? "").trim() || null;
  const durationLabel = String(formData.get("durationLabel") ?? "").trim() || null;
  const contentType = String(formData.get("contentType") ?? "").trim();
  const filename = String(formData.get("filename") ?? "").trim();
  const mediaType = detectMediaType(contentType, filename);

  try {
    return await upsertMediaAsset({
      url,
      alt,
      mediaType,
      posterUrl,
      durationLabel,
      driver: "r2",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save media row.";
    return { ok: false, error: message };
  }
}

/**
 * Upload a file from admin FormData and insert a media_assets row.
 * Local next dev → public/media; small prod fallback → R2 via Worker
 * (prefer prepareMediaUpload + browser PUT for videos).
 */
export async function uploadMediaAsset(formData: FormData): Promise<UploadMediaResult> {
  await requireAdminAction();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  // Guardrail: Workers cannot reliably buffer large videos through a server action.
  const { getMediaDriver } = await import("@/lib/media/driver");
  if (getMediaDriver() === "r2" && file.size > 4 * 1024 * 1024) {
    return {
      ok: false,
      error:
        "File is too large for Worker upload. Use the direct R2 upload path (reload admin if you still see this).",
    };
  }

  const alt = String(formData.get("alt") ?? "").trim() || null;
  const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";
  const preferredFileName = String(formData.get("fileName") ?? "").trim() || undefined;
  const posterUrl = String(formData.get("posterUrl") ?? "").trim() || null;
  const durationLabel = String(formData.get("durationLabel") ?? "").trim() || null;
  const contentType = file.type || "application/octet-stream";
  const mediaType = detectMediaType(contentType, file.name);
  const body = Buffer.from(await file.arrayBuffer());

  // Dynamic import keeps sharp/AWS out of admin list-page bundles.
  const { uploadMedia } = await import("@/lib/media/storage");

  try {
    const uploaded = await uploadMedia({
      body,
      contentType,
      folder,
      filename: file.name,
      preferredFileName,
    });

    return await upsertMediaAsset({
      url: uploaded.url,
      alt,
      mediaType,
      posterUrl,
      durationLabel,
      driver: uploaded.driver,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return { ok: false, error: message };
  }
}

export async function getAdminMediaDriver() {
  await requireAdminAction();
  const { getMediaDriver } = await import("@/lib/media/driver");
  return getMediaDriver();
}
