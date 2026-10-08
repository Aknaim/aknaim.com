import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export type R2UploadInput = {
  body: Buffer | Uint8Array;
  contentType: string;
  /** Optional folder prefix, e.g. `climbing/halloween-green` */
  folder?: string;
  /** Original filename used only for extension inference */
  filename?: string;
  /** Optional fixed object name, e.g. `still.jpg` */
  preferredFileName?: string;
};

export type R2UploadResult = {
  key: string;
  url: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Set R2 credentials in .env (local) or Worker secrets (prod).`);
  }
  return value;
}

export { isR2Configured } from "@/lib/media/driver";

function getR2Client(): S3Client {
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

export function getR2PublicBaseUrl(): string {
  return requiredEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
}

export function getR2PublicHostname(): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

function buildObjectKey(input: {
  folder?: string;
  filename?: string;
  preferredFileName?: string;
  contentType: string;
}): string {
  const ext = extensionFrom(input.filename ?? input.preferredFileName, input.contentType);
  const folder = input.folder?.replace(/^\/+|\/+$/g, "") ?? "uploads";
  const fileName =
    input.preferredFileName?.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "") ||
    `${randomUUID()}.${ext}`;
  return `${folder}/${fileName}`;
}

/** Upload bytes to R2 and return the public HTTPS URL. */
export async function uploadToR2(input: R2UploadInput): Promise<R2UploadResult> {
  const bucket = requiredEnv("R2_BUCKET");
  const key = buildObjectKey(input);
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    key,
    url: `${getR2PublicBaseUrl()}/${key}`,
  };
}

export type R2PresignedPut = {
  key: string;
  publicUrl: string;
  uploadUrl: string;
  contentType: string;
};

/**
 * Browser uploads go straight to R2 (Worker cannot buffer large MP4s).
 * Requires R2 bucket CORS for PUT from your site origin.
 */
export async function presignR2Put(input: {
  contentType: string;
  folder?: string;
  filename?: string;
  preferredFileName?: string;
  expiresInSeconds?: number;
}): Promise<R2PresignedPut> {
  const bucket = requiredEnv("R2_BUCKET");
  const key = buildObjectKey(input);
  const contentType = input.contentType || "application/octet-stream";
  const client = getR2Client();
  // Only ContentType is signed — client must send the same header. Avoid
  // CacheControl here so browsers don't need extra signed headers.
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 60 * 30,
  });

  return {
    key,
    publicUrl: `${getR2PublicBaseUrl()}/${key}`,
    uploadUrl,
    contentType,
  };
}

/**
 * Move/rename an object under the public R2 base URL into folder/preferredFileName.
 * No-op when URL is not on this bucket or already at the destination.
 */
export async function relocateR2PublicUrl(
  url: string,
  folder: string,
  preferredFileName: string
): Promise<string> {
  const base = getR2PublicBaseUrl();
  if (!url.startsWith(`${base}/`)) return url;

  const sourceKey = decodeURIComponent(url.slice(base.length + 1).split("?")[0] ?? "");
  const destFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
  const destName =
    preferredFileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "") ||
    "file";
  const destKey = `${destFolder}/${destName}`;
  if (!sourceKey || sourceKey === destKey) {
    return `${base}/${destKey}`;
  }

  const bucket = requiredEnv("R2_BUCKET");
  const client = getR2Client();
  const copySource = `${bucket}/${sourceKey
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;

  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: copySource,
      Key: destKey,
    })
  );

  // Only delete the source when it looks like a temporary upload (uuid filename).
  // Never delete canonical keys like highlight.webp / hero.webp / still.jpg — other
  // media_assets rows may still reference them after a "fallback" copy.
  const sourceBase = sourceKey.split("/").pop() ?? "";
  const looksTemporary =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i.test(
      sourceBase
    );
  if (sourceKey !== destKey && looksTemporary) {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: sourceKey,
        })
      );
    } catch {
      // keep dest even if delete of old key fails
    }
  }

  return `${base}/${destKey}`;
}
