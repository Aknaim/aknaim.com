import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import { purgeCache } from "@opennextjs/cloudflare/overrides/cache-purge/index";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Without an incremental cache, `revalidate` is a no-op on Workers and every
 * request re-runs SSR (CPU → Error 1102). R2 + DO queue + D1 tags fix that.
 *
 * `cachePurge` is required for on-demand `revalidatePath` to actually clear the
 * regional Cache API — without it, admin saves look like “data disappeared”
 * while Neon is fine, and STALE storms re-SSR heavy pages → more 1102s.
 *
 * Secrets (Worker): CACHE_PURGE_ZONE_ID + CACHE_PURGE_API_TOKEN (Cache Purge).
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
    // Lazy R2 refresh can race and re-seed stale entries after revalidate.
    shouldLazilyUpdateOnCacheHit: false,
  }),
  queue: doQueue,
  tagCache: d1NextTagCache,
  enableCacheInterception: true,
  cachePurge: purgeCache({ type: "direct" }),
});
