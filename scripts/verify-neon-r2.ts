import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = (process.env.DATABASE_URL_NEON_PRODUCTION ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  const sql = postgres(url, { max: 1, ssl: "require" });
  try {
    await sql`select set_config('search_path', 'public', false)`;
    const sample = await sql`
      select url from public.media_assets
      where url like 'https://media.aknaim.com/%'
      limit 3
    `;
    for (const row of sample) {
      const res = await fetch(row.url, { method: "HEAD" });
      console.log(`${res.status} ${row.url.split("/").slice(-2).join("/")}`);
    }
    const sends = await sql`select count(*)::int as n from public.climbing_sends`;
    const https =
      await sql`select count(*)::int as n from public.media_assets where url like 'https://%'`;
    console.log(`climbing_sends=${sends[0].n} https_media=${https[0].n}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
