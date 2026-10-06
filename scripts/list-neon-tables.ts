import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = (process.env.DATABASE_URL_NEON_PRODUCTION ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (!url) throw new Error("missing neon url");
  const sql = postgres(url, { max: 1, ssl: "require" });
  try {
    const tables = await sql`
      select tablename
      from pg_tables
      where schemaname = 'public'
      order by tablename
    `;
    console.log(`public_tables=${tables.length}`);
    for (const t of tables) console.log(` - ${t.tablename}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
