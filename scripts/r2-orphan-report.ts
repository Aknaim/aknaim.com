/**
 * Dry-run: list R2 objects not referenced by media_assets (url / poster_url).
 *
 * Usage:
 *   npx tsx scripts/r2-orphan-report.ts           # Neon media_assets (default)
 *   npx tsx scripts/r2-orphan-report.ts --local   # DATABASE_URL instead
 *
 * Writes scripts/_tmp-r2-orphan-report.json and prints a folder summary.
 * Does not delete anything.
 */
import "dotenv/config";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { writeFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { getR2PublicBaseUrl, isR2Configured } from "../src/lib/media/r2";

function cleanUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function keyFromMediaUrl(url: string, publicBase: string): string | null {
  const base = publicBase.replace(/\/$/, "");
  if (url.startsWith(`${base}/`)) {
    return url.slice(base.length + 1).split("?")[0] ?? null;
  }
  if (url.startsWith("/media/")) {
    return url.slice("/media/".length).split("?")[0] ?? null;
  }
  return null;
}

function folderOf(key: string): string {
  const parts = key.split("/");
  if (parts.length <= 1) return "(root)";
  // interest / trip-or-climb / …
  return parts.slice(0, Math.min(2, parts.length - 1 || 1)).join("/");
}

async function listAllKeys(client: S3Client, bucket: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: token,
        MaxKeys: 1000,
      })
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function main() {
  if (!isR2Configured()) {
    throw new Error("R2_* env vars required to list the bucket");
  }

  const useLocal = process.argv.includes("--local");
  const dbUrl = useLocal
    ? cleanUrl(process.env.DATABASE_URL)
    : cleanUrl(process.env.DATABASE_URL_NEON_PRODUCTION) ||
      cleanUrl(process.env.DATABASE_URL);

  if (!dbUrl) {
    throw new Error(
      useLocal
        ? "DATABASE_URL is required"
        : "DATABASE_URL_NEON_PRODUCTION (or DATABASE_URL) is required"
    );
  }

  const isNeon = dbUrl.includes("neon.tech") || dbUrl.includes("neon.database");
  const publicBase = getR2PublicBaseUrl();
  const bucket = requiredEnv("R2_BUCKET");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  const sql = postgres(dbUrl, { max: 1, ssl: isNeon ? "require" : false });
  try {
    const rows = await sql`
      SELECT url, poster_url AS "posterUrl"
      FROM media_assets
    `;

    const referenced = new Set<string>();
    for (const row of rows) {
      const urlKey = keyFromMediaUrl(String(row.url), publicBase);
      if (urlKey) referenced.add(urlKey);
      if (row.posterUrl) {
        const posterKey = keyFromMediaUrl(String(row.posterUrl), publicBase);
        if (posterKey) referenced.add(posterKey);
      }
    }

    const allKeys = await listAllKeys(client, bucket);
    const orphans = allKeys.filter((key) => !referenced.has(key)).sort();

    const byFolder: Record<string, string[]> = {};
    for (const key of orphans) {
      const folder = folderOf(key);
      (byFolder[folder] ??= []).push(key);
    }

    const folderSummary = Object.entries(byFolder)
      .map(([folder, keys]) => ({ folder, count: keys.length }))
      .sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder));

    const report = {
      generatedAt: new Date().toISOString(),
      dbTarget: useLocal ? "local" : isNeon ? "neon" : "database",
      bucket,
      publicBase,
      r2ObjectCount: allKeys.length,
      referencedKeyCount: referenced.size,
      orphanCount: orphans.length,
      folderSummary,
      byFolder,
      orphans,
    };

    const outPath = path.join(process.cwd(), "scripts", "_tmp-r2-orphan-report.json");
    writeFileSync(outPath, JSON.stringify(report, null, 2));

    console.log(
      `R2 ${bucket}: ${allKeys.length} objects, ${referenced.size} referenced keys, ${orphans.length} orphans`
    );
    console.log("\nBy folder (top-level interest / second segment):");
    for (const row of folderSummary) {
      console.log(`  ${String(row.count).padStart(4)}  ${row.folder}`);
    }
    console.log(`\nFull report → ${outPath}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
