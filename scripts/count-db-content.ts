import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const neon = url.includes("neon.tech") || url.includes("neon.database");
  console.log(`target=${neon ? "neon" : "local-or-other"}`);

  const sql = postgres(url, { max: 1, ssl: neon ? "require" : undefined });
  try {
    const sends = await sql`select count(*)::int as n from climbing_sends`;
    const media = await sql`select count(*)::int as n from media_assets`;
    const gallery =
      await sql`select count(*)::int as n from gallery_items where interest = 'climbing'`;
    const localMedia =
      await sql`select count(*)::int as n from media_assets where url like '/media/%'`;
    const r2Media =
      await sql`select count(*)::int as n from media_assets where url like 'https://%'`;
    console.log(`climbing_sends=${sends[0].n}`);
    console.log(`media_assets=${media[0].n}`);
    console.log(`climbing_gallery=${gallery[0].n}`);
    console.log(`media_local_paths=${localMedia[0].n}`);
    console.log(`media_https_paths=${r2Media[0].n}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("FAILED:");
  console.error(error);
  process.exit(1);
});
