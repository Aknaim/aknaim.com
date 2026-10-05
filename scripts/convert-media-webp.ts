/**
 * Convert local /media image files (jpg/png/…) to webp and update media_assets URLs.
 * Usage: npx tsx --env-file=.env scripts/convert-media-webp.ts
 */
import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { eq, like, or, sql } from "drizzle-orm";
import sharp from "sharp";
import { db } from "../src/lib/db";
import { mediaAssets } from "../src/lib/db/schema";

const EXT_RE = /\.(jpe?g|png|gif|avif|tiff?)$/i;

async function main() {
  const rows = await db
    .select({
      id: mediaAssets.id,
      url: mediaAssets.url,
      posterUrl: mediaAssets.posterUrl,
      mediaType: mediaAssets.mediaType,
    })
    .from(mediaAssets)
    .where(
      or(
        like(mediaAssets.url, "%.jpg"),
        like(mediaAssets.url, "%.jpeg"),
        like(mediaAssets.url, "%.png"),
        like(mediaAssets.url, "%.gif"),
        like(mediaAssets.posterUrl, "%.jpg"),
        like(mediaAssets.posterUrl, "%.jpeg"),
        like(mediaAssets.posterUrl, "%.png")
      )
    );

  let converted = 0;
  let updated = 0;

  for (const row of rows) {
    let nextUrl = row.url;
    let nextPoster = row.posterUrl;

    if (row.mediaType === "image" && row.url.startsWith("/media/") && EXT_RE.test(row.url)) {
      const sourceKey = row.url.replace(/^\/media\//, "");
      const sourceAbs = path.join(process.cwd(), "public", "media", ...sourceKey.split("/"));
      const destUrl = row.url.replace(EXT_RE, ".webp");
      const destKey = destUrl.replace(/^\/media\//, "");
      const destAbs = path.join(process.cwd(), "public", "media", ...destKey.split("/"));

      try {
        const input = await readFile(sourceAbs);
        const webp = await sharp(input).rotate().webp({ quality: 82 }).toBuffer();
        await writeFile(destAbs, webp);
        if (destAbs !== sourceAbs) {
          await rm(sourceAbs, { force: true });
        }
        nextUrl = destUrl;
        converted += 1;
        console.log(`converted ${row.url} → ${destUrl} (${input.length} → ${webp.length} bytes)`);
      } catch (error) {
        console.warn(`skip file ${row.url}:`, error instanceof Error ? error.message : error);
      }
    }

    if (nextPoster && nextPoster.startsWith("/media/") && EXT_RE.test(nextPoster)) {
      nextPoster = nextPoster.replace(EXT_RE, ".webp");
    }

    if (nextUrl !== row.url || nextPoster !== row.posterUrl) {
      // Avoid unique conflicts if dest URL already exists on another row.
      if (nextUrl !== row.url) {
        const [conflict] = await db
          .select({ id: mediaAssets.id })
          .from(mediaAssets)
          .where(eq(mediaAssets.url, nextUrl))
          .limit(1);
        if (conflict && conflict.id !== row.id) {
          console.warn(`URL conflict for ${nextUrl}; leaving ${row.id} on ${row.url}`);
          nextUrl = row.url;
        }
      }

      await db
        .update(mediaAssets)
        .set({
          url: nextUrl,
          posterUrl: nextPoster,
          createdAt: new Date(),
        })
        .where(eq(mediaAssets.id, row.id));
      updated += 1;
    }
  }

  // Point any remaining posters at webp stills when the file exists as webp.
  await db.execute(sql`
    update media_assets
    set poster_url = regexp_replace(poster_url, '\.(jpe?g|png|gif)$', '.webp', 'i')
    where poster_url ~* '\.(jpe?g|png|gif)$'
  `);

  console.log(`Done. Converted files: ${converted}. Updated rows: ${updated}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
