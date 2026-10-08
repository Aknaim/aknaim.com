import { siteData } from "@/lib/data";
import { db } from "@/lib/db";
import { destinations, recipes } from "@/lib/db/schema";

/** Static public surfaces that can hold ISR / R2 cache. */
export const STATIC_PUBLIC_PATHS = [
  "/",
  "/about",
  "/climbing",
  "/gallery/climbing",
  "/travel",
  "/gallery/travel",
  "/cooking",
  "/gallery/cooking",
  "/photography",
  "/carpentry",
  "/languages",
  "/chess",
  "/video-games",
] as const;

export const COURSE_PUBLIC_PATHS = [
  "/photography",
  "/cooking",
  "/carpentry",
  "/languages",
] as const;

export const CLIMBING_PUBLIC_PATHS = [
  "/climbing",
  "/gallery/climbing",
] as const;

export const TRAVEL_PUBLIC_PATHS = [
  "/travel",
  "/gallery/travel",
] as const;

/** Every public path that should be busted after deploy or Refresh all. */
export async function listPublicPathsToRevalidate(): Promise<string[]> {
  const paths = new Set<string>(STATIC_PUBLIC_PATHS);

  for (const interest of siteData.interests) {
    paths.add(`/interests/${interest.id}`);
  }

  const [tripRows, recipeRows] = await Promise.all([
    db.select({ id: destinations.id }).from(destinations),
    db.select({ slug: recipes.slug }).from(recipes),
  ]);

  for (const row of tripRows) {
    paths.add(`/travel/${row.id}`);
  }
  for (const row of recipeRows) {
    paths.add(`/cooking/${row.slug}`);
  }

  return [...paths];
}

export async function listTravelPathsToRevalidate(): Promise<string[]> {
  const paths = new Set<string>(TRAVEL_PUBLIC_PATHS);
  const rows = await db.select({ id: destinations.id }).from(destinations);
  for (const row of rows) {
    paths.add(`/travel/${row.id}`);
  }
  return [...paths];
}
