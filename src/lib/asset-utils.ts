import { existsSync } from "fs";
import { join } from "path";
import { siteData } from "./data";

/**
 * Server-only: checks whether a file exists under `public/`.
 * Do not import this module from client components.
 *
 * On Cloudflare Workers / OpenNext, static files live in the assets binding — not
 * on the Worker filesystem — so `existsSync(public/...)` is always false there.
 * Treat shipped `/images/...` assets as present in production; still probe disk
 * in local `next dev` so unfinished placeholders can fall back.
 */
export function publicAssetExists(src: string): boolean {
  if (!src || !src.startsWith("/")) {
    return true;
  }

  // Absolute remote URLs (R2, etc.)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return true;
  }

  // Bundled static marketing/hero assets — always available via asset CDN in prod.
  if (process.env.NODE_ENV === "production" && src.startsWith("/images/")) {
    return true;
  }

  // Cloudflare / edge runtimes have no real public/ tree to probe.
  if (process.env.NEXT_RUNTIME === "edge") {
    return true;
  }

  try {
    const filePath = join(process.cwd(), "public", src);
    return existsSync(filePath);
  } catch {
    // fs unavailable — assume present; AssetImage onError still covers real 404s.
    return true;
  }
}

/** Precompute fallback flags for all image paths in siteData (avoids network 404s). */
export function buildAssetFallbackMap(): Record<string, boolean> {
  const paths = new Set<string>();

  for (const interest of siteData.interests) {
    paths.add(interest.bagImage);
    paths.add(interest.peekImage);
  }

  for (const project of siteData.projects) {
    paths.add(project.image);
    if (project.category === "cooking" || project.category === "travel") {
      paths.add(project.thumbnail);
    }
    if (project.category === "engineering") {
      paths.add(project.diagramImage);
    }
  }

  const map: Record<string, boolean> = {};
  for (const src of paths) {
    map[src] = !publicAssetExists(src);
  }

  return map;
}
