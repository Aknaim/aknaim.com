import { and, asc, desc, eq, sql } from "drizzle-orm";
import { gradeFilterKey } from "@/lib/climbing-grades";
import { db } from "@/lib/db";
import { climbingSends, galleryItems, mediaAssets } from "@/lib/db/schema";
import type { GalleryInterest, GalleryItem } from "@/lib/types/gallery";

export async function getGalleryItems(
  interest: GalleryInterest,
  filters: Record<string, string> = {}
): Promise<GalleryItem[]> {
  const rows = await db
    .select({
      id: galleryItems.id,
      title: galleryItems.title,
      dateTaken: galleryItems.dateTaken,
      filters: galleryItems.filters,
      recipeSlug: galleryItems.recipeSlug,
      durationLabel: galleryItems.durationLabel,
      url: mediaAssets.url,
      alt: mediaAssets.alt,
      mediaType: mediaAssets.mediaType,
      posterUrl: mediaAssets.posterUrl,
      mediaDurationLabel: mediaAssets.durationLabel,
      createdAt: mediaAssets.createdAt,
    })
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(
      and(eq(galleryItems.interest, interest), eq(galleryItems.published, true))
    )
    .orderBy(desc(galleryItems.dateTaken), asc(galleryItems.sortOrder));

  // Prefer the send's precise grade over older coarse gallery filter keys (5-12 vs 5-12-).
  const gradeByClimbSlug =
    interest === "climbing"
      ? new Map(
          (
            await db
              .select({ slug: climbingSends.slug, grade: climbingSends.grade })
              .from(climbingSends)
          ).map((row) => [row.slug, gradeFilterKey(row.grade)] as const)
        )
      : null;

  // `sort` is a URL param for the client view, not an item filter field.
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => key !== "sort" && value && value !== "all"
  );

  return rows
    .map((row) => {
      const climbSlug = row.filters.climb;
      const preciseGrade =
        gradeByClimbSlug && climbSlug
          ? gradeByClimbSlug.get(climbSlug)
          : undefined;
      const itemFilters =
        preciseGrade && preciseGrade !== row.filters.grade
          ? { ...row.filters, grade: preciseGrade }
          : row.filters;
      return { ...row, filters: itemFilters };
    })
    .filter((row) =>
      activeFilters.every(([key, value]) => {
        if (key === "year") {
          return String(row.dateTaken).startsWith(value);
        }
        return row.filters[key] === value;
      })
    )
    .map((row) => {
      const dateTaken = String(row.dateTaken);
      const version = row.createdAt ? new Date(row.createdAt).getTime() : 0;
      const withCacheBust = (url: string) =>
        url.includes("?") ? url : `${url}?v=${version}`;
      return {
        id: row.id,
        src: withCacheBust(row.url),
        alt: row.alt ?? row.title ?? row.id,
        title: row.title ?? undefined,
        dateTaken,
        year: Number.parseInt(dateTaken.slice(0, 4), 10),
        filters: row.filters,
        duration: row.durationLabel ?? row.mediaDurationLabel ?? undefined,
        mediaType: row.mediaType,
        posterSrc: row.posterUrl ? withCacheBust(row.posterUrl) : undefined,
        recipeSlug: row.recipeSlug ?? undefined,
      };
    });
}

export async function countGalleryItems(interest: GalleryInterest): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(galleryItems)
    .where(
      and(eq(galleryItems.interest, interest), eq(galleryItems.published, true))
    );
  return row?.count ?? 0;
}
