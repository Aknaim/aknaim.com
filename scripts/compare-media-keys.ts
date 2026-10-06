import "dotenv/config";
import postgres from "postgres";
import { readdirSync } from "node:fs";
import path from "node:path";
import { getLocalMediaRoot } from "../src/lib/media/storage";

async function main() {
  const url = (process.env.DATABASE_URL_NEON_PRODUCTION ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  const sql = postgres(url, { max: 1, ssl: "require" });
  try {
    await sql`select set_config('search_path', 'public', false)`;
    const rows = await sql`
      select url from public.media_assets
      where url like 'https://media.aknaim.com/%'
      order by url
      limit 15
    `;
    console.log("Sample Neon media URLs (path after host):");
    for (const row of rows) {
      const key = row.url.replace("https://media.aknaim.com/", "");
      console.log(`  ${key}`);
    }

    const root = getLocalMediaRoot();
    const climbing = path.join(root, "climbing");
    console.log(`\nLocal climbing folders under ${climbing}:`);
    for (const name of readdirSync(climbing).slice(0, 20)) {
      console.log(`  ${name}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
