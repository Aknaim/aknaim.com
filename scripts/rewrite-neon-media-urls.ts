import "dotenv/config";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { mediaAssets } from "../src/lib/db/schema";
import { getR2PublicBaseUrl, isR2Configured } from "../src/lib/media/r2";

function clean(raw: string | undefined) {
  return (raw ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function rewriteMediaPath(value: string, publicBase: string): string {
  if (!value.startsWith("/media/")) return value;
  return `${publicBase}/${value.slice("/media/".length)}`;
}

async function main() {
  const neonUrl = clean(process.env.DATABASE_URL_NEON_PRODUCTION);
  if (!neonUrl) throw new Error("DATABASE_URL_NEON_PRODUCTION missing");
  if (!isR2Configured()) throw new Error("R2_* missing");

  const sql = postgres(neonUrl, {
    max: 1,
    ssl: "require",
    connection: { search_path: "public" },
  });
  try {
    await sql`select set_config('search_path', 'public', false)`;
    const sends = await sql`select count(*)::int as n from public.climbing_sends`;
    const media = await sql`select count(*)::int as n from public.media_assets`;
    const local =
      await sql`select count(*)::int as n from public.media_assets where url like '/media/%'`;
    console.log(
      `neon climbing_sends=${sends[0].n} media=${media[0].n} local_urls=${local[0].n}`
    );
  } finally {
    await sql.end({ timeout: 5 });
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

  const sql2 = postgres(neonUrl, { max: 1, ssl: "require" });
  try {
    const https =
      await sql2`select count(*)::int as n from media_assets where url like 'https://%'`;
    const localLeft =
      await sql2`select count(*)::int as n from media_assets where url like '/media/%'`;
    console.log(`after: https_urls=${https[0].n} local_urls=${localLeft[0].n}`);
  } finally {
    await sql2.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
