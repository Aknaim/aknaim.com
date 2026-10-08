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

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return true;
  }

  if (process.env.NODE_ENV === "production" && src.startsWith("/images/")) {
    return true;
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    return true;
  }

  try {
    const filePath = join(process.cwd(), "public", src);
    return existsSync(filePath);
  } catch {
    return true;
  }
}

/** Home shelf only — bag/peek images. Avoid scanning all projects on every SSR. */
export function buildHomeAssetFallbackMap(): Record<string, boolean> {
  const paths = new Set<string>();

  for (const interest of siteData.interests) {
    paths.add(interest.bagImage);
    paths.add(interest.peekImage);
  }

  const map: Record<string, boolean> = {};
  for (const src of paths) {
    map[src] = !publicAssetExists(src);
  }
  return map;
}

/** @deprecated Prefer buildHomeAssetFallbackMap on the homepage. */
export function buildAssetFallbackMap(): Record<string, boolean> {
  return buildHomeAssetFallbackMap();
}
