import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { gradeFilterKey } from "@/lib/climbing-grades";
import { db } from "@/lib/db";
import { climbingSends, galleryItems, mediaAssets } from "@/lib/db/schema";
import type { GalleryInterest, GalleryItem } from "@/lib/types/gallery";

export const GALLERY_PAGE_SIZE = 48;

export type GalleryPageResult = {
  items: GalleryItem[];
  total: number;
  /** Distinct values for countDistinctKey (e.g. unique climbs) when requested. */
  totalDistinct?: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

/** Lightweight rows for sidebar filter counts (no media URLs). */
export type GalleryFilterIndexItem = {
  filters: Record<string, string>;
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
  "result",
]);

/**
 * Normalize climbing_sends.grade the same way as gradeFilterKey()
 * (5.12+ → 5-12+, V5 → v5).
 */
const sendGradeKeySql = sql`
  CASE
    WHEN ${climbingSends.grade} IS NULL THEN NULL
    WHEN lower(replace(replace(btrim(${climbingSends.grade}), '.', '-'), ' ', '')) ~ '^v[0-9]+'
      THEN 'v' || (regexp_match(
        lower(replace(replace(btrim(${climbingSends.grade}), '.', '-'), ' ', '')),
        '^v([0-9]+)'
      ))[1]
    WHEN lower(replace(replace(btrim(${climbingSends.grade}), '.', '-'), ' ', '')) ~ '^5-[0-9]+([+-])?'
      THEN '5-' || (regexp_match(
        lower(replace(replace(btrim(${climbingSends.grade}), '.', '-'), ' ', '')),
        '^5-([0-9]+)([+-])?'
      ))[1] || COALESCE(
        (regexp_match(
          lower(replace(replace(btrim(${climbingSends.grade}), '.', '-'), ' ', '')),
          '^5-([0-9]+)([+-])?'
        ))[2],
        ''
      )
    ELSE lower(replace(replace(btrim(${climbingSends.grade}), '.', '-'), ' ', ''))
  END
`;

/** Prefer send grade (precise) over stored gallery filters.grade. */
const effectiveClimbingGradeSql = sql`
  COALESCE(${sendGradeKeySql}, ${galleryItems.filters}->>'grade')
`;

function gradeRankSql(gradeExpr: SQL) {
  return sql`
    CASE
      WHEN ${gradeExpr} ~ '^v[0-9]+$' THEN
        (regexp_match(${gradeExpr}, '^v([0-9]+)$'))[1]::int
      WHEN ${gradeExpr} ~ '^5-[0-9]+([+-])?$' THEN
        (regexp_match(${gradeExpr}, '^5-([0-9]+)'))[1]::int * 3
        + CASE
            WHEN ${gradeExpr} LIKE '%+' THEN 2
            WHEN ${gradeExpr} LIKE '%-' THEN 0
            ELSE 1
          END
      ELSE -1
    END
  `;
}

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
    if (key === "grade" && interest === "climbing") {
      // Match send grade when present — same as client display override.
      clauses.push(sql`${effectiveClimbingGradeSql} = ${value}`);
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

function galleryOrderBy(sortId: string, interest: GalleryInterest) {
  switch (sortId) {
    case "date-asc":
      return [asc(galleryItems.dateTaken), asc(galleryItems.sortOrder)];
    case "title-asc":
      return [asc(galleryItems.title), asc(galleryItems.sortOrder)];
    case "grade-desc": {
      const gradeExpr =
        interest === "climbing"
          ? effectiveClimbingGradeSql
          : sql`${galleryItems.filters}->>'grade'`;
      return [
        sql`CASE WHEN ${gradeExpr} ~ '^v' THEN 0 ELSE 1 END`,
        sql`${gradeRankSql(gradeExpr)} DESC`,
        desc(galleryItems.dateTaken),
        asc(galleryItems.sortOrder),
      ];
    }
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

const climbSlugJoin = sql`${climbingSends.slug} = ${galleryItems.filters}->>'climb'`;

/** Full interest dump — prefer getGalleryPage for public galleries (Worker-safe). */
export async function getGalleryItems(
  interest: GalleryInterest,
  filters: Record<string, string> = {}
): Promise<GalleryItem[]> {
  const where = and(...galleryFilterClauses(interest, filters));
  const base = db
    .select(gallerySelect)
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id));

  const rows =
    interest === "climbing"
      ? await base
          .leftJoin(climbingSends, climbSlugJoin)
          .where(where)
          .orderBy(...galleryOrderBy(filters.sort ?? "date-desc", interest))
      : await base
          .where(where)
          .orderBy(...galleryOrderBy(filters.sort ?? "date-desc", interest));

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
  /** When set, also return count(distinct filters->>key). */
  countDistinctKey?: string;
}): Promise<GalleryPageResult> {
  const filters = input.filters ?? {};
  const sort = input.sort ?? filters.sort ?? "date-desc";
  const limit = Math.min(Math.max(input.limit ?? GALLERY_PAGE_SIZE, 1), 100);
  const offset = Math.max(input.offset ?? 0, 0);
  const where = and(...galleryFilterClauses(input.interest, filters));
  const distinctKey = input.countDistinctKey;
  const distinctAllowed =
    distinctKey === "climb" ||
    distinctKey === "trip" ||
    distinctKey === "category";
  const climbing = input.interest === "climbing";

  const countBase = db
    .select({
      count: sql<number>`count(*)::int`,
      totalDistinct: distinctAllowed
        ? sql<number>`count(distinct ${galleryItems.filters}->>${sql.raw(`'${distinctKey}'`)})::int`
        : sql<number>`null::int`,
    })
    .from(galleryItems);

  const [countRow] = climbing
    ? await countBase.leftJoin(climbingSends, climbSlugJoin).where(where)
    : await countBase.where(where);

  const pageBase = db
    .select(gallerySelect)
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id));

  const rows = climbing
    ? await pageBase
        .leftJoin(climbingSends, climbSlugJoin)
        .where(where)
        .orderBy(...galleryOrderBy(sort, input.interest))
        .limit(limit)
        .offset(offset)
    : await pageBase
        .where(where)
        .orderBy(...galleryOrderBy(sort, input.interest))
        .limit(limit)
        .offset(offset);

  const gradeByClimbSlug = climbing ? await climbingGradeMap() : null;
  const items = mapGalleryRows(rows, gradeByClimbSlug);
  const total = countRow?.count ?? 0;

  return {
    items,
    total,
    totalDistinct:
      distinctAllowed && countRow?.totalDistinct != null
        ? countRow.totalDistinct
        : undefined,
    offset,
    limit,
    hasMore: offset + items.length < total,
  };
}

/**
 * Filter metadata for all published items (no media) — restores sidebar counts
 * under pagination without pulling image/video URLs.
 */
export async function getGalleryFilterIndex(
  interest: GalleryInterest
): Promise<GalleryFilterIndexItem[]> {
  if (interest === "climbing") {
    const rows = await db
      .select({
        filters: galleryItems.filters,
        sendGrade: climbingSends.grade,
      })
      .from(galleryItems)
      .leftJoin(climbingSends, climbSlugJoin)
      .where(
        and(eq(galleryItems.interest, interest), eq(galleryItems.published, true))
      );

    return rows.map((row) => {
      const filters = { ...row.filters };
      if (row.sendGrade) {
        filters.grade = gradeFilterKey(row.sendGrade);
      }
      return { filters };
    });
  }

  const rows = await db
    .select({ filters: galleryItems.filters })
    .from(galleryItems)
    .where(
      and(eq(galleryItems.interest, interest), eq(galleryItems.published, true))
    );

  return rows.map((row) => ({ filters: row.filters }));
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
