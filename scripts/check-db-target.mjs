import "dotenv/config";

const u = (process.env.DATABASE_URL || "").trim().replace(/^['"]|['"]$/g, "");
const neon = u.includes("neon.tech") || u.includes("neon.database");
console.log(`DATABASE_URL=${u ? "set" : "MISSING"}`);
console.log(`target=${neon ? "neon" : "local-or-other"}`);
console.log(
  `DATABASE_URL_NEON_PRODUCTION=${process.env.DATABASE_URL_NEON_PRODUCTION ? "set" : "no"}`
);
console.log(
  `R2=${
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE_URL
      ? "ready"
      : "missing"
  }`
);
if (u) {
  try {
    const host = new URL(u.replace(/^postgresql:/, "http:")).hostname;
    console.log(`db_host=${host}`);
  } catch {
    console.log("db_host=unparsed");
  }
}
