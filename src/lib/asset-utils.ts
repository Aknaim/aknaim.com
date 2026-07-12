import { existsSync } from "fs";
import { join } from "path";
import { siteData } from "./data";

/**
 * Server-only: checks whether a file exists under `public/`.
 * Do not import this module from client components.
 */
export function publicAssetExists(src: string): boolean {
  if (!src || !src.startsWith("/")) {
    return true;
  }

  const filePath = join(process.cwd(), "public", src);
  return existsSync(filePath);
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
