import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL
  );
}

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

/** Upload bytes to R2 and return the public HTTPS URL. */
export async function uploadToR2(input: R2UploadInput): Promise<R2UploadResult> {
  const bucket = requiredEnv("R2_BUCKET");
  const ext = extensionFrom(input.filename ?? input.preferredFileName, input.contentType);
  const folder = input.folder?.replace(/^\/+|\/+$/g, "") ?? "uploads";
  const fileName =
    input.preferredFileName?.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "") ||
    `${randomUUID()}.${ext}`;
  const key = `${folder}/${fileName}`;
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
