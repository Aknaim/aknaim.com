/**
 * Find / delete media_assets rows with no FK references from content tables.
 *
 * Usage:
 *   npx tsx scripts/media-unused-cleanup.ts              # dry-run (DATABASE_URL)
 *   npx tsx scripts/media-unused-cleanup.ts --apply      # delete unused rows
 *   npx tsx scripts/media-unused-cleanup.ts --neon       # use DATABASE_URL_NEON_PRODUCTION
 *   npx tsx scripts/media-unused-cleanup.ts --neon --apply
 *
 * Does not delete R2 objects — only unreferenced DB rows.
 * Gallery duplicate rows: reported separately (same media_asset_id twice).
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

function cleanUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^['"]|['"]$/g, "");
}

const UNUSED_SQL = `
SELECT m.id, m.url
FROM media_assets m
WHERE NOT EXISTS (SELECT 1 FROM gallery_items g WHERE g.media_asset_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM recipes r WHERE r.image_media_id = m.id OR r.hero_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM recipe_steps s WHERE s.image_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM recipe_final_images f WHERE f.media_asset_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM climbing_projects p WHERE p.image_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM climbing_sends c WHERE c.image_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM destinations d WHERE d.image_media_id = m.id)
  AND NOT EXISTS (
    SELECT 1 FROM trips t
    WHERE t.hero_media_id = m.id
       OR t.route_map_media_id = m.id
       OR t.gear_media_id = m.id
  )
  AND NOT EXISTS (SELECT 1 FROM trip_moments tm WHERE tm.image_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM trip_favorite_places fp WHERE fp.image_media_id = m.id)
ORDER BY m.url
`;

const DUP_GALLERY_SQL = `
SELECT g.interest, g.media_asset_id::text AS media_asset_id, m.url, count(*)::int AS n
FROM gallery_items g
JOIN media_assets m ON m.id = g.media_asset_id
WHERE g.published = true
GROUP BY 1, 2, 3
HAVING count(*) > 1
ORDER BY n DESC, g.interest
`;

async function main() {
  const apply = process.argv.includes("--apply");
  const useNeon = process.argv.includes("--neon");
  const raw = useNeon
    ? cleanUrl(process.env.DATABASE_URL_NEON_PRODUCTION)
    : cleanUrl(process.env.DATABASE_URL);

  if (!raw) {
    throw new Error(
      useNeon
        ? "DATABASE_URL_NEON_PRODUCTION is required"
        : "DATABASE_URL is required"
    );
  }

  const isNeon = raw.includes("neon.tech") || raw.includes("neon.database");
  if (useNeon && !isNeon) {
    throw new Error("--neon requires a Neon URL");
  }
  if (!useNeon && isNeon) {
    throw new Error(
      "DATABASE_URL points at Neon — pass --neon explicitly if you intend to touch production"
    );
  }

  const sql = postgres(raw, { max: 1, ssl: isNeon ? "require" : false });
  try {
    const unused = await sql.unsafe(UNUSED_SQL) as Array<{ id: string; url: string }>;
    const dups = await sql.unsafe(DUP_GALLERY_SQL) as Array<{
      interest: string;
      media_asset_id: string;
      url: string;
      n: number;
    }>;

    const report = {
      target: useNeon ? "neon" : "local",
      generatedAt: new Date().toISOString(),
      apply,
      unusedCount: unused.length,
      galleryDuplicateGroups: dups.length,
      unused: unused.slice(0, 200),
      galleryDuplicates: dups,
    };

    const outPath = path.join(
      process.cwd(),
      "scripts",
      `_tmp-media-unused-${useNeon ? "neon" : "local"}.json`
    );
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(
      `${useNeon ? "Neon" : "Local"}: ${unused.length} unused media_assets; ${dups.length} gallery duplicate groups`
    );
    console.log(`Report → ${outPath}`);

    if (dups.length > 0) {
      console.log("Gallery duplicates (same media_asset_id on multiple items):");
      for (const row of dups.slice(0, 20)) {
        console.log(`  ${row.interest} ×${row.n} ${row.url}`);
      }
    }

    if (!apply) {
      console.log("Dry-run only. Re-run with --apply to delete unused media_assets rows.");
      return;
    }

    if (unused.length === 0) {
      console.log("Nothing to delete.");
      return;
    }

    const ids = unused.map((row) => row.id);
    const deleted = await sql`
      DELETE FROM media_assets
      WHERE id IN ${sql(ids)}
      RETURNING id
    `;
    console.log(`Deleted ${deleted.length} unused media_assets row(s).`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
