/**
 * Copy local Docker Postgres → Neon, then rewrite /media/... → R2 URLs.
 *
 * Requires Docker Desktop. Uses:
 *   DATABASE_URL (local)
 *   DATABASE_URL_NEON_PRODUCTION (Neon)
 *   R2_* for rewrite
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { mediaAssets } from "../src/lib/db/schema";
import { getR2PublicBaseUrl, isR2Configured } from "../src/lib/media/r2";

function cleanUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function run(cmd: string, args: string[], opts?: { allowExit1?: boolean }) {
  // Never shell:true — Neon URLs contain & which Windows cmd splits.
  console.log(`$ ${cmd} ${args.map((a) => (a.includes("://") ? "[url]" : a)).join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  const code = result.status ?? 1;
  if (code !== 0) {
    if (opts?.allowExit1 && code === 1) {
      console.warn("Command exited 1 (often non-fatal for pg_restore); continuing…");
      return;
    }
    throw new Error(`${cmd} failed with exit ${code}`);
  }
}

function rewriteMediaPath(value: string, publicBase: string): string {
  if (!value.startsWith("/media/")) return value;
  return `${publicBase}/${value.slice("/media/".length)}`;
}

async function rewriteNeonUrls(neonUrl: string) {
  if (!isR2Configured()) {
    throw new Error("R2_* env vars required for URL rewrite");
  }
  const base = getR2PublicBaseUrl().replace(/\/$/, "");
  const db = drizzleNeon(neon(neonUrl), { schema: { mediaAssets } });
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
  console.log(`Rewrote ${updated} media_assets row(s) → ${base}/…`);
}

async function main() {
  const localUrl = cleanUrl(process.env.DATABASE_URL);
  const neonUrl = cleanUrl(process.env.DATABASE_URL_NEON_PRODUCTION);
  const dbUser = process.env.POSTGRES_USER?.trim() || "aknaim";
  const dbName = process.env.POSTGRES_DB?.trim() || "aknaim";

  if (!localUrl) throw new Error("DATABASE_URL (local) is required");
  if (!neonUrl) throw new Error("DATABASE_URL_NEON_PRODUCTION is required");
  if (localUrl.includes("neon.tech")) {
    throw new Error("DATABASE_URL must point at local Docker, not Neon");
  }
  if (!neonUrl.includes("neon.tech") && !neonUrl.includes("neon.database")) {
    throw new Error("DATABASE_URL_NEON_PRODUCTION must be a Neon URL");
  }

  const dir = mkdtempSync(path.join(tmpdir(), "aknaim-db-"));
  const dumpHost = path.join(dir, "local.dump");
  const dumpContainer = "/tmp/aknaim-local.dump";

  try {
    console.log("1/3 Dumping local Docker Postgres…");
    run("docker", [
      "compose",
      "-f",
      "docker-compose.dev.yml",
      "exec",
      "-T",
      "db",
      "pg_dump",
      "-U",
      dbUser,
      "-Fc",
      "--no-owner",
      "--no-acl",
      "-f",
      dumpContainer,
      dbName,
    ]);
    run("docker", [
      "compose",
      "-f",
      "docker-compose.dev.yml",
      "cp",
      `db:${dumpContainer}`,
      dumpHost,
    ]);

    const size = statSync(dumpHost).size;
    console.log(`Dump size: ${size} bytes`);
    if (size < 1000) {
      throw new Error("Dump file looks empty — aborting before touching Neon");
    }

    console.log("2/3 Restoring dump into Neon…");
    const neonWithSsl = neonUrl.includes("sslmode=")
      ? neonUrl
      : `${neonUrl}${neonUrl.includes("?") ? "&" : "?"}sslmode=require`;

    run(
      "docker",
      [
        "run",
        "--rm",
        "-v",
        `${dir}:/dump`,
        "postgres:16-alpine",
        "pg_restore",
        `--dbname=${neonWithSsl}`,
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-acl",
        "/dump/local.dump",
      ],
      { allowExit1: true }
    );

    console.log("3/3 Rewriting media URLs to R2 on Neon…");
    await rewriteNeonUrls(neonUrl);
    console.log("Done. Neon mirrors local data with R2 media URLs.");
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
