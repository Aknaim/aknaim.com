/**
 * Sync local media folder → Cloudflare R2 (safe to re-run).
 *
 * Usage:
 *   # Put R2_* (+ LOCAL_MEDIA_ROOT) in .env for this run, then:
 *   npm run media:sync-r2
 *
 *   # Also rewrite /media/... URLs in DATABASE_URL's media_assets:
 *   npm run media:sync-r2 -- --rewrite-db
 *
 *   npm run media:sync-r2 -- --dry-run
 */
import "dotenv/config";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { mediaAssets } from "../src/lib/db/schema";
import { getR2PublicBaseUrl, isR2Configured } from "../src/lib/media/r2";
import { syncLocalFileToR2 } from "../src/lib/media/r2-sync";
import { getLocalMediaRoot } from "../src/lib/media/storage";

async function listFilesRecursive(root: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
      } else if (entry.isFile()) {
        out.push(abs);
      }
    }
  }

  await walk(root);
  return out;
}

/** `/media/<key>` → `https://media.example.com/<key>` */
function rewriteMediaPath(value: string, publicBase: string): string {
  if (!value.startsWith("/media/")) return value;
  return `${publicBase}/${value.slice("/media/".length)}`;
}

async function rewriteDatabaseUrls(publicBase: string) {
  const raw = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (!raw) {
    throw new Error("DATABASE_URL is required for --rewrite-db");
  }

  const isNeon = raw.includes("neon.tech") || raw.includes("neon.database");
  const client = isNeon ? null : postgres(raw, { max: 1 });
  const db = isNeon
    ? drizzleNeon(neon(raw), { schema: { mediaAssets } })
    : drizzle(client!, { schema: { mediaAssets } });

  const base = publicBase.replace(/\/$/, "");
  const rows = await db
    .select({
      id: mediaAssets.id,
      url: mediaAssets.url,
      posterUrl: mediaAssets.posterUrl,
    })
    .from(mediaAssets);

  let updated = 0;
  for (const row of rows) {
    const nextUrl = rewriteMediaPath(row.url, base);
    const nextPoster = row.posterUrl
      ? rewriteMediaPath(row.posterUrl, base)
      : row.posterUrl;

    if (nextUrl === row.url && nextPoster === row.posterUrl) continue;

    await db
      .update(mediaAssets)
      .set({ url: nextUrl, posterUrl: nextPoster })
      .where(eq(mediaAssets.id, row.id));
    updated += 1;
  }

  console.log(`Rewrote ${updated} media_assets row(s) to ${base}/…`);

  if (client) {
    await client.end({ timeout: 5 });
  }
}

async function main() {
  const rewriteDb = process.argv.includes("--rewrite-db");
  const dryRun = process.argv.includes("--dry-run");

  if (!isR2Configured()) {
    throw new Error(
      "R2_* env vars missing. Add them to .env for this sync (you can remove write keys afterward)."
    );
  }

  const root = getLocalMediaRoot();
  const rootStat = await stat(root).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new Error(`Local media root not found: ${root}`);
  }

  const files = await listFilesRecursive(root);
  console.log(`Found ${files.length} file(s) under ${root}`);
  console.log(`Target: ${getR2PublicBaseUrl()} (bucket ${process.env.R2_BUCKET})`);

  let uploaded = 0;
  let skipped = 0;

  for (const abs of files) {
    const rel = path.relative(root, abs).split(path.sep).join("/");
    if (dryRun) {
      console.log(`[dry-run] ${rel}`);
      continue;
    }
    const result = await syncLocalFileToR2(abs, rel);
    if (result.skipped) {
      skipped += 1;
      console.log(`skip  ${rel}`);
    } else {
      uploaded += 1;
      console.log(`put   ${rel}`);
    }
  }

  console.log(`Done. uploaded=${uploaded} skipped=${skipped} dryRun=${dryRun}`);

  if (rewriteDb) {
    if (dryRun) {
      console.log("[dry-run] would rewrite DB urls");
    } else {
      await rewriteDatabaseUrls(getR2PublicBaseUrl());
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
