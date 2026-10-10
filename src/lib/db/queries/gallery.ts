import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { gradeFilterKey } from "@/lib/climbing-grades";
import { db } from "@/lib/db";
import { climbingSends, galleryItems, mediaAssets } from "@/lib/db/schema";
import type { GalleryInterest, GalleryItem } from "@/lib/types/gallery";

export const GALLERY_PAGE_SIZE = 48;

export type GalleryPageResult = {
  items: GalleryItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

type GalleryRow = {
  id: string;
  title: string | null;
  dateTaken: string | Date;
  filters: Record<string, string>;
  recipeSlug: string | null;
  durationLabel: string | null;
  url: string;
  alt: string | null;
  mediaType: "image" | "video";
  posterUrl: string | null;
  mediaDurationLabel: string | null;
  createdAt: Date | null;
};

function mapGalleryRows(
  rows: GalleryRow[],
  gradeByClimbSlug: Map<string, string> | null
): GalleryItem[] {
  return rows.map((row) => {
    const climbSlug = row.filters.climb;
    const preciseGrade =
      gradeByClimbSlug && climbSlug ? gradeByClimbSlug.get(climbSlug) : undefined;
    const itemFilters =
      preciseGrade && preciseGrade !== row.filters.grade
        ? { ...row.filters, grade: preciseGrade }
        : row.filters;
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
      filters: itemFilters,
      duration: row.durationLabel ?? row.mediaDurationLabel ?? undefined,
      mediaType: row.mediaType,
      posterSrc: row.posterUrl ? withCacheBust(row.posterUrl) : undefined,
      recipeSlug: row.recipeSlug ?? undefined,
    };
  });
}

const JSON_FILTER_KEYS = new Set([
  "trip",
  "category",
  "location",
  "grade",
  "climb",
  "color",
  "type",
  "cuisine",
]);

function galleryFilterClauses(
  interest: GalleryInterest,
  filters: Record<string, string>
): SQL[] {
  const clauses: SQL[] = [
    eq(galleryItems.interest, interest),
    eq(galleryItems.published, true),
  ];

  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "all" || key === "sort") continue;
    if (key === "year") {
      if (!/^\d{4}$/.test(value)) continue;
      clauses.push(sql`${galleryItems.dateTaken}::text like ${`${value}-%`}`);
      continue;
    }
    if (!JSON_FILTER_KEYS.has(key)) continue;
    // Key is whitelisted — embed as a literal for jsonb ->> .
    clauses.push(
      sql`${galleryItems.filters}->>${sql.raw(`'${key}'`)} = ${value}`
    );
  }

  return clauses;
}

function galleryOrderBy(sortId: string) {
  switch (sortId) {
    case "date-asc":
      return [asc(galleryItems.dateTaken), asc(galleryItems.sortOrder)];
    case "title-asc":
      return [asc(galleryItems.title), asc(galleryItems.sortOrder)];
    case "date-desc":
    default:
      return [desc(galleryItems.dateTaken), asc(galleryItems.sortOrder)];
  }
}

const gallerySelect = {
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
};

async function climbingGradeMap(): Promise<Map<string, string>> {
  const rows = await db
    .select({ slug: climbingSends.slug, grade: climbingSends.grade })
    .from(climbingSends);
  return new Map(rows.map((row) => [row.slug, gradeFilterKey(row.grade)] as const));
}

/** Full interest dump — prefer getGalleryPage for travel (Worker-safe). */
export async function getGalleryItems(
  interest: GalleryInterest,
  filters: Record<string, string> = {}
): Promise<GalleryItem[]> {
  const where = and(...galleryFilterClauses(interest, filters));
  const rows = await db
    .select(gallerySelect)
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(where)
    .orderBy(...galleryOrderBy(filters.sort ?? "date-desc"));

  const gradeByClimbSlug = interest === "climbing" ? await climbingGradeMap() : null;
  return mapGalleryRows(rows, gradeByClimbSlug);
}

/** Paginated gallery read — filters/sort applied in SQL. */
export async function getGalleryPage(input: {
  interest: GalleryInterest;
  filters?: Record<string, string>;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<GalleryPageResult> {
  const filters = input.filters ?? {};
  const sort = input.sort ?? filters.sort ?? "date-desc";
  const limit = Math.min(Math.max(input.limit ?? GALLERY_PAGE_SIZE, 1), 100);
  const offset = Math.max(input.offset ?? 0, 0);
  const where = and(...galleryFilterClauses(input.interest, filters));

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(galleryItems)
    .where(where);

  const rows = await db
    .select(gallerySelect)
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(where)
    .orderBy(...galleryOrderBy(sort))
    .limit(limit)
    .offset(offset);

  const gradeByClimbSlug =
    input.interest === "climbing" ? await climbingGradeMap() : null;
  const items = mapGalleryRows(rows, gradeByClimbSlug);
  const total = countRow?.count ?? 0;

  return {
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total,
  };
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

/** Distinct years for travel (or other) gallery filter options — no full dump. */
export async function getGalleryYears(interest: GalleryInterest): Promise<number[]> {
  const rows = await db
    .select({
      year: sql<number>`extract(year from ${galleryItems.dateTaken})::int`,
    })
    .from(galleryItems)
    .where(
      and(eq(galleryItems.interest, interest), eq(galleryItems.published, true))
    )
    .groupBy(sql`extract(year from ${galleryItems.dateTaken})`)
    .orderBy(sql`extract(year from ${galleryItems.dateTaken}) desc`);

  return rows.map((row) => row.year).filter((year) => Number.isFinite(year));
}
