import { copyFile, mkdir, readdir, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  convertImageToWebp,
  shouldConvertImageToWebp,
  toWebpFileName,
} from "@/lib/media/image-convert";
import { isR2Configured, uploadToR2 } from "@/lib/media/r2";

export type MediaDriver = "local" | "r2";

export type MediaUploadInput = {
  body: Buffer | Uint8Array;
  contentType: string;
  /** Path prefix under media root, e.g. `climbing/halloween-green` */
  folder?: string;
  /** Original upload name (extension fallback) */
  filename?: string;
  /** Optional fixed object name, e.g. `still.webp` / `send.mp4` */
  preferredFileName?: string;
};

export type MediaUploadResult = {
  key: string;
  url: string;
  driver: MediaDriver;
};

function extensionFrom(filename: string | undefined, contentType: string): string {
  if (filename) {
    const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (match) return match[1];
  }
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "video/webm") return "webm";
  return "bin";
}

function sanitizeFolder(folder: string | undefined): string {
  const cleaned = (folder ?? "uploads")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.\./g, "");
  return cleaned || "uploads";
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "") || "file";
}

/**
 * Local next dev → filesystem under public/media (default).
 * Production → R2 (requires R2_* secrets).
 * Override with MEDIA_DRIVER=local|r2 (never point local .env at prod R2).
 */
export function getMediaDriver(): MediaDriver {
  const forced = process.env.MEDIA_DRIVER?.trim().toLowerCase();
  if (forced === "local") return "local";
  if (forced === "r2") return "r2";
  return process.env.NODE_ENV === "production" ? "r2" : "local";
}

export function getLocalMediaRoot(): string {
  return path.join(process.cwd(), "public", "media");
}

async function prepareUpload(input: MediaUploadInput): Promise<MediaUploadInput> {
  if (!shouldConvertImageToWebp(input.contentType)) {
    return input;
  }

  const body = await convertImageToWebp(input.body);
  const preferredFileName = toWebpFileName(input.preferredFileName);
  return {
    ...input,
    body,
    contentType: "image/webp",
    preferredFileName,
    filename: preferredFileName ?? "image.webp",
  };
}

async function uploadToLocal(input: MediaUploadInput): Promise<MediaUploadResult> {
  const folder = sanitizeFolder(input.folder);
  const ext = extensionFrom(input.filename ?? input.preferredFileName, input.contentType);
  const fileName = sanitizeFileName(
    input.preferredFileName?.trim() || `${randomUUID()}.${ext}`
  );
  const key = `${folder}/${fileName}`;
  const absolute = path.join(getLocalMediaRoot(), ...key.split("/"));

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, input.body);

  return {
    key,
    url: `/media/${key}`,
    driver: "local",
  };
}

/**
 * Move a local `/media/...` file into a new folder with a fixed filename.
 * No-op (returns original url) for remote URLs or when already in place.
 */
export async function relocateLocalMediaUrl(
  url: string,
  folder: string,
  preferredFileName: string
): Promise<string> {
  if (!url.startsWith("/media/")) return url;

  const targetFolder = sanitizeFolder(folder);
  const fileName = sanitizeFileName(preferredFileName);
  const targetKey = `${targetFolder}/${fileName}`;
  const targetUrl = `/media/${targetKey}`;
  if (url === targetUrl) return url;

  const sourceKey = url.replace(/^\/media\//, "");
  const sourceAbs = path.join(getLocalMediaRoot(), ...sourceKey.split("/"));
  const targetAbs = path.join(getLocalMediaRoot(), ...targetKey.split("/"));

  try {
    await mkdir(path.dirname(targetAbs), { recursive: true });
    await rm(targetAbs, { force: true });
    try {
      await rename(sourceAbs, targetAbs);
    } catch {
      await copyFile(sourceAbs, targetAbs);
      await rm(sourceAbs, { force: true });
    }
    return targetUrl;
  } catch {
    // Source missing or unreadable — keep original URL so save can continue.
    return url;
  }
}

/** Remove a local media folder if it exists (used after climb rename). */
export async function removeLocalMediaFolder(folder: string): Promise<void> {
  const targetFolder = sanitizeFolder(folder);
  const absolute = path.join(getLocalMediaRoot(), ...targetFolder.split("/"));
  try {
    await rm(absolute, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

/** True when a local media folder has no files left. */
export async function localMediaFolderIsEmpty(folder: string): Promise<boolean> {
  const targetFolder = sanitizeFolder(folder);
  const absolute = path.join(getLocalMediaRoot(), ...targetFolder.split("/"));
  try {
    const entries = await readdir(absolute);
    return entries.length === 0;
  } catch {
    return true;
  }
}

/** Store bytes via the active media driver and return a public URL. */
export async function uploadMedia(input: MediaUploadInput): Promise<MediaUploadResult> {
  const prepared = await prepareUpload(input);
  const driver = getMediaDriver();

  if (driver === "local") {
    return uploadToLocal(prepared);
  }

  if (!isR2Configured()) {
    throw new Error(
      "MEDIA_DRIVER is r2 (or production) but R2 is not configured. Set R2_* Worker secrets, or use MEDIA_DRIVER=local for filesystem uploads."
    );
  }

  const uploaded = await uploadToR2({
    body: prepared.body,
    contentType: prepared.contentType,
    folder: sanitizeFolder(prepared.folder),
    filename: prepared.filename,
    preferredFileName: prepared.preferredFileName,
  });

  return { ...uploaded, driver: "r2" };
}
