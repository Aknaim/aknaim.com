import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getR2PublicBaseUrl, isR2Configured } from "./r2";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}

function getClient(): S3Client {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}

/** True when an object with the same key and size already exists in R2. */
export async function r2ObjectMatches(
  key: string,
  sizeBytes: number
): Promise<boolean> {
  if (!isR2Configured()) return false;
  const client = getClient();
  const bucket = requiredEnv("R2_BUCKET");
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );
    return head.ContentLength === sizeBytes;
  } catch {
    return false;
  }
}

/**
 * Stream a local file to R2 at an exact object key (preserves folder layout).
 * Skips upload when the remote object already has the same size.
 */
export async function syncLocalFileToR2(
  absolutePath: string,
  key: string
): Promise<{ key: string; url: string; skipped: boolean }> {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured. Set R2_* env vars for this command.");
  }

  const info = await stat(absolutePath);
  const publicUrl = `${getR2PublicBaseUrl()}/${key}`;

  if (await r2ObjectMatches(key, info.size)) {
    return { key, url: publicUrl, skipped: true };
  }

  const client = getClient();
  const bucket = requiredEnv("R2_BUCKET");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(absolutePath),
      ContentType: contentTypeFor(absolutePath),
      ContentLength: info.size,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { key, url: publicUrl, skipped: false };
}
