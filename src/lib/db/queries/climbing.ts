import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  climbingLocations,
  climbingProgression,
  climbingProjects,
  climbingStats,
  gearItems,
  mediaAssets,
} from "@/lib/db/schema";
import type {
  ClimbingProject,
  ProgressionMilestone,
  ProjectStatus,
} from "@/lib/climbingData";

export type { ClimbingProject, ProgressionMilestone, ProjectStatus };

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  "in-progress": "In Progress",
  projecting: "Projecting",
  "on-deck": "On Deck",
};

export async function getClimbingStats() {
  const [row] = await db.select().from(climbingStats).where(eq(climbingStats.id, 1)).limit(1);

  return {
    sessions: row?.sessions ?? 0,
    locations: row?.locations ?? 0,
    routesSent: row?.routesSent ?? 0,
    outdoorTrips: row?.outdoorTrips ?? 0,
  };
}

export async function getClimbingProjects(): Promise<ClimbingProject[]> {
  const rows = await db
    .select({
      id: climbingProjects.id,
      grade: climbingProjects.grade,
      name: climbingProjects.name,
      locationId: climbingProjects.locationId,
      locationName: climbingLocations.name,
      type: climbingProjects.type,
      status: climbingProjects.status,
      imageSrc: mediaAssets.url,
    })
    .from(climbingProjects)
    .innerJoin(
      climbingLocations,
      eq(climbingProjects.locationId, climbingLocations.id)
    )
    .innerJoin(mediaAssets, eq(climbingProjects.imageMediaId, mediaAssets.id))
    .orderBy(asc(climbingProjects.sortOrder));

  return rows.map((row) => ({
    id: row.id,
    grade: row.grade,
    name: row.name,
    location: row.locationName,
    locationId: row.locationId,
    type: row.type,
    status: row.status,
    imageSrc: row.imageSrc,
  }));
}

export async function getClimbingProgression(): Promise<ProgressionMilestone[]> {
  const rows = await db
    .select({
      year: climbingProgression.yearLabel,
      label: climbingProgression.milestoneLabel,
    })
    .from(climbingProgression)
    .orderBy(asc(climbingProgression.sortOrder));

  return rows;
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
