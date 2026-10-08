/**
 * After deploy: revalidate all public ISR paths on the live site, then optionally
 * purge the Cloudflare zone cache so R2/regional hits don't keep stale HTML.
 *
 * Env:
 *   SITE_URL                 default https://aknaim.com
 *   REVALIDATE_SECRET        preferred bearer secret (falls back to SESSION_SECRET)
 *   SESSION_SECRET           fallback bearer (already a Worker secret)
 *   CACHE_PURGE_ZONE_ID      optional Cloudflare zone purge
 *   CACHE_PURGE_API_TOKEN    optional Cloudflare API token with Cache Purge
 */
import "dotenv/config";

const siteUrl = (process.env.SITE_URL ?? "https://aknaim.com").replace(/\/$/, "");
const secret =
  process.env.REVALIDATE_SECRET?.trim() ||
  process.env.SESSION_SECRET?.trim();

if (!secret) {
  console.error(
    "post-deploy-refresh: set REVALIDATE_SECRET or SESSION_SECRET in the environment."
  );
  process.exit(1);
}

const revalidateUrl = `${siteUrl}/api/revalidate-public`;
console.log(`Revalidating public pages via ${revalidateUrl} …`);

const response = await fetch(revalidateUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
    Accept: "application/json",
  },
});

const body = await response.text();
let json;
try {
  json = JSON.parse(body);
} catch {
  json = { raw: body };
}

if (!response.ok) {
  console.error("Revalidate failed:", response.status, json);
  process.exit(1);
}

console.log("Revalidate ok:", json);

const zoneId = process.env.CACHE_PURGE_ZONE_ID?.trim();
const purgeToken = process.env.CACHE_PURGE_API_TOKEN?.trim();

if (zoneId && purgeToken) {
  console.log("Purging Cloudflare zone cache …");
  const purgeResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${purgeToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purge_everything: true }),
    }
  );
  const purgeJson = await purgeResponse.json();
  if (!purgeResponse.ok || !purgeJson.success) {
    console.error("Zone purge failed:", purgeResponse.status, purgeJson);
    process.exit(1);
  }
  console.log("Zone purge ok.");
} else {
  console.log(
    "Skipping zone purge (set CACHE_PURGE_ZONE_ID + CACHE_PURGE_API_TOKEN to enable)."
  );
}

console.log("Post-deploy refresh complete.");
