import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = (process.env.DATABASE_URL_NEON_PRODUCTION ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  const sql = postgres(url, { max: 1, ssl: "require" });
  try {
    const db = await sql`select current_database() as db, current_user as usr, current_schema as schema`;
    console.log(db[0]);
    const exists = await sql`
      select to_regclass('public.climbing_sends') as reg,
             to_regclass('public.media_assets') as media
    `;
    console.log(exists[0]);
    const tables = await sql`
      select n.nspname as schema, c.relname as name
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r' and c.relname in ('climbing_sends','media_assets')
    `;
    console.log("matches", tables);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
