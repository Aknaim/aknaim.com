import "dotenv/config";
import postgres from "postgres";

async function inspect(label: string, rawUrl: string | undefined) {
  const url = (rawUrl ?? "").trim().replace(/^['"]|['"]$/g, "");
  if (!url) {
    console.log(`${label}: MISSING`);
    return;
  }
  const neon = url.includes("neon.tech") || url.includes("neon.database");
  console.log(`${label}: ${neon ? "neon" : "other"}`);
  const sql = postgres(url, { max: 1, ssl: neon ? "require" : false });
  try {
    const sends = await sql`select count(*)::int as n from climbing_sends`;
    const media = await sql`select count(*)::int as n from media_assets`;
    const localMedia =
      await sql`select count(*)::int as n from media_assets where url like '/media/%'`;
    const httpsMedia =
      await sql`select count(*)::int as n from media_assets where url like 'https://%'`;
    console.log(
      `  climbing_sends=${sends[0].n} media_assets=${media[0].n} local_urls=${localMedia[0].n} https_urls=${httpsMedia[0].n}`
    );
  } catch (error) {
    console.log(
      `  ERROR: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main() {
  await inspect("DATABASE_URL", process.env.DATABASE_URL);
  await inspect(
    "DATABASE_URL_NEON_PRODUCTION",
    process.env.DATABASE_URL_NEON_PRODUCTION
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
