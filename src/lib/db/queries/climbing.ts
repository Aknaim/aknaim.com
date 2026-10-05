import { asc, count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import {
  BASELINE_PROGRESSION,
  buildProgressionFromSends,
  gradesFromBaseline,
  hardestGradeLabel,
  mergeProgression,
  type ProgressionMilestone,
} from "@/lib/climbing-progression";
import { db } from "@/lib/db";
import {
  climbingLocations,
  climbingSends,
  climbingSessions,
  gearItems,
  mediaAssets,
} from "@/lib/db/schema";
import type { ClimbType } from "@/lib/climbing-grades";

export type { ProgressionMilestone };

/** Clean successful sends only — excludes one-hang and project. */
const ROUTES_SENT_RESULTS = ["onsight", "flash", "redpoint", "send"] as const;

export async function getClimbingStats() {
  const [[sessionRow], [locationRow], [sendRow], [outdoorRow]] = await Promise.all([
    db.select({ value: count() }).from(climbingSessions),
    db
      .select({ value: countDistinct(climbingSessions.locationId) })
      .from(climbingSessions),
    db
      .select({ value: count() })
      .from(climbingSends)
      .where(inArray(climbingSends.result, [...ROUTES_SENT_RESULTS])),
    db
      .select({ value: count() })
      .from(climbingSessions)
      .innerJoin(
        climbingLocations,
        eq(climbingSessions.locationId, climbingLocations.id)
      )
      .where(eq(climbingLocations.kind, "outdoor")),
  ]);

  return {
    sessions: sessionRow?.value ?? 0,
    locations: locationRow?.value ?? 0,
    routesSent: sendRow?.value ?? 0,
    outdoorTrips: outdoorRow?.value ?? 0,
  };
}

async function loadProgressionSends() {
  const rows = await db
    .select({
      grade: climbingSends.grade,
      type: climbingSends.type,
      result: climbingSends.result,
      sessionDate: climbingSessions.sessionDate,
    })
    .from(climbingSends)
    .leftJoin(climbingSessions, eq(climbingSends.sessionId, climbingSessions.id));

  return rows.map((row) => ({
    grade: row.grade,
    type: row.type as ClimbType,
    result: row.result,
    sessionDate: row.sessionDate ? String(row.sessionDate) : null,
  }));
}

/**
 * Progression from logged climb dates (5.11+ / V5+),
 * plus baseline firsts that predate the media logbook.
 */
export async function getClimbingProgression(): Promise<ProgressionMilestone[]> {
  const sends = await loadProgressionSends();
  const derived = buildProgressionFromSends(sends);
  return mergeProgression(BASELINE_PROGRESSION, derived);
}

export async function getClimbingCurrentLevel(): Promise<string | null> {
  const sends = await loadProgressionSends();
  return hardestGradeLabel([...gradesFromBaseline(BASELINE_PROGRESSION), ...sends]);
}

export async function getClimbingGearItems() {
  return db
    .select({
      title: gearItems.title,
      description: gearItems.description,
    })
    .from(gearItems)
    .where(eq(gearItems.interest, "climbing"))
    .orderBy(asc(gearItems.sortOrder));
}

export function getClimbingGalleryHref(filters?: {
  location?: string;
  type?: string;
}): string {
  const params = new URLSearchParams();
  if (filters?.location) params.set("location", filters.location);
  if (filters?.type) params.set("type", filters.type);
  const qs = params.toString();
  return qs ? `/gallery/climbing?${qs}` : "/gallery/climbing";
}

export async function getClimbingLocations() {
  return db
    .select({
      id: climbingLocations.id,
      name: climbingLocations.name,
      kind: climbingLocations.kind,
    })
    .from(climbingLocations)
    .orderBy(asc(climbingLocations.name));
}

export type AdminClimbingSend = {
  id: string;
  slug: string;
  grade: string;
  routeName: string;
  locationId: string;
  locationName: string;
  type: "lead" | "bouldering" | "top-rope";
  color: string | null;
  result: string;
  sessionDate: string | null;
  sendDateLabel: string;
  durationLabel: string;
  imageSrc: string;
  sortOrder: number;
};

function formatAdminDate(isoDate: string | null, fallbackLabel: string): string {
  if (!isoDate) return fallbackLabel && fallbackLabel !== "—" ? fallbackLabel : "No date";
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function listClimbingSends(): Promise<AdminClimbingSend[]> {
  const rows = await db
    .select({
      id: climbingSends.id,
      slug: climbingSends.slug,
      grade: climbingSends.grade,
      routeName: climbingSends.routeName,
      locationId: climbingSends.locationId,
      locationName: climbingLocations.name,
      type: climbingSends.type,
      color: climbingSends.color,
      result: climbingSends.result,
      sessionDate: climbingSessions.sessionDate,
      sendDateLabel: climbingSends.sendDateLabel,
      durationLabel: climbingSends.durationLabel,
      imageSrc: mediaAssets.url,
      sortOrder: climbingSends.sortOrder,
    })
    .from(climbingSends)
    .innerJoin(
      climbingLocations,
      eq(climbingSends.locationId, climbingLocations.id)
    )
    .innerJoin(mediaAssets, eq(climbingSends.imageMediaId, mediaAssets.id))
    .leftJoin(climbingSessions, eq(climbingSends.sessionId, climbingSessions.id))
    .orderBy(desc(climbingSessions.sessionDate), asc(climbingSends.sortOrder));

  return rows.map((row) => ({
    ...row,
    sessionDate: row.sessionDate ? String(row.sessionDate) : null,
  }));
}

export async function getClimbingSendBySlug(
  slug: string
): Promise<AdminClimbingSend | null> {
  const [row] = await db
    .select({
      id: climbingSends.id,
      slug: climbingSends.slug,
      grade: climbingSends.grade,
      routeName: climbingSends.routeName,
      locationId: climbingSends.locationId,
      locationName: climbingLocations.name,
      type: climbingSends.type,
      color: climbingSends.color,
      result: climbingSends.result,
      sessionDate: climbingSessions.sessionDate,
      sendDateLabel: climbingSends.sendDateLabel,
      durationLabel: climbingSends.durationLabel,
      imageSrc: mediaAssets.url,
      sortOrder: climbingSends.sortOrder,
    })
    .from(climbingSends)
    .innerJoin(
      climbingLocations,
      eq(climbingSends.locationId, climbingLocations.id)
    )
    .innerJoin(mediaAssets, eq(climbingSends.imageMediaId, mediaAssets.id))
    .leftJoin(climbingSessions, eq(climbingSends.sessionId, climbingSessions.id))
    .where(eq(climbingSends.slug, slug))
    .limit(1);

  if (!row) return null;
  return {
    ...row,
    sessionDate: row.sessionDate ? String(row.sessionDate) : null,
  };
}

export { formatAdminDate };
