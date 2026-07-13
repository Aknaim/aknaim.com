import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  destinations,
  mediaAssets,
  travelStats,
  tripFavoritePlaces,
  tripFieldNotes,
  tripMoments,
  tripRouteStops,
  trips,
  tripTimeline,
} from "@/lib/db/schema";
import type { Destination } from "@/lib/travelData";
import type { GalleryConfig } from "@/lib/types/gallery";
import type { TripDetail } from "@/lib/types/travel";
import { getGalleryItems } from "@/lib/db/queries/gallery";

export type { Destination };

const CATEGORY_LABELS: Record<string, string> = {
  landscapes: "Landscapes",
  portraits: "Portraits",
  architecture: "Architecture",
  food: "Food & Dining",
  details: "Details",
  urban: "Urban",
};

export async function getTravelStats() {
  const [row] = await db.select().from(travelStats).where(eq(travelStats.id, 1)).limit(1);

  return {
    places: row?.places ?? 0,
    photos: row?.photosLabel ?? "0",
    notes: row?.notesLabel ?? "0",
    memories: row?.memoriesLabel ?? "0",
  };
}

export async function getDestinations(): Promise<Destination[]> {
  const rows = await db
    .select({
      id: destinations.id,
      number: destinations.displayNumber,
      title: destinations.title,
      subtitle: destinations.subtitle,
      photosCount: destinations.photosCount,
      notesCount: destinations.notesCount,
      date: destinations.dateLabel,
      imageSrc: mediaAssets.url,
      mapX: destinations.mapX,
      mapY: destinations.mapY,
    })
    .from(destinations)
    .innerJoin(mediaAssets, eq(destinations.imageMediaId, mediaAssets.id))
    .orderBy(asc(destinations.sortOrder));

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    photosCount: row.photosCount,
    notesCount: row.notesCount,
    date: row.date,
    imageSrc: row.imageSrc,
    mapCoordinates: { x: row.mapX, y: row.mapY },
  }));
}

export async function getTripById(id: string): Promise<TripDetail | null> {
  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip) return null;

  const [hero] = await db
    .select({ url: mediaAssets.url })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, trip.heroMediaId))
    .limit(1);
  const [routeMap] = await db
    .select({ url: mediaAssets.url })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, trip.routeMapMediaId))
    .limit(1);
  const [gear] = await db
    .select({ url: mediaAssets.url })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, trip.gearMediaId))
    .limit(1);

  const stops = await db
    .select()
    .from(tripRouteStops)
    .where(eq(tripRouteStops.tripId, id))
    .orderBy(asc(tripRouteStops.sortOrder));

  const timeline = await db
    .select()
    .from(tripTimeline)
    .where(eq(tripTimeline.tripId, id))
    .orderBy(asc(tripTimeline.sortOrder));

  const moments = await db
    .select({
      title: tripMoments.title,
      photoCount: tripMoments.photoCount,
      imageSrc: mediaAssets.url,
    })
    .from(tripMoments)
    .innerJoin(mediaAssets, eq(tripMoments.imageMediaId, mediaAssets.id))
    .where(eq(tripMoments.tripId, id))
    .orderBy(asc(tripMoments.sortOrder));

  const notes = await db
    .select({ noteText: tripFieldNotes.noteText })
    .from(tripFieldNotes)
    .where(eq(tripFieldNotes.tripId, id))
    .orderBy(asc(tripFieldNotes.sortOrder));

  const places = await db
    .select({
      title: tripFavoritePlaces.title,
      location: tripFavoritePlaces.location,
      description: tripFavoritePlaces.description,
      imageSrc: mediaAssets.url,
    })
    .from(tripFavoritePlaces)
    .innerJoin(mediaAssets, eq(tripFavoritePlaces.imageMediaId, mediaAssets.id))
    .where(eq(tripFavoritePlaces.tripId, id))
    .orderBy(asc(tripFavoritePlaces.sortOrder));

  return {
    id: trip.id,
    country: trip.country,
    date: trip.dateLabel,
    summary: trip.summary,
    heroImage: hero?.url ?? "",
    stats: {
      days: trip.statDays,
      regions: trip.statRegions,
      photos: trip.statPhotos,
      countries: trip.statCountries,
    },
    route: {
      mapImage: routeMap?.url ?? "",
      stops: stops.map((stop) => ({
        name: stop.name,
        coordinates: { x: stop.coordX, y: stop.coordY },
      })),
    },
    timeline: timeline.map((item) => ({
      day: item.dayLabel,
      label: item.label,
    })),
    moments,
    fieldNotes: notes.map((note) => note.noteText),
    favoritePlaces: places,
    gearImage: gear?.url ?? "",
    reflection: {
      excerpt: trip.reflectionExcerpt,
      slug: trip.reflectionSlug,
    },
  };
}

export async function getTripIds(): Promise<string[]> {
  const rows = await db.select({ id: trips.id }).from(trips);
  return rows.map((row) => row.id);
}

export async function getTravelGalleryConfig(): Promise<GalleryConfig> {
  const [destList, items] = await Promise.all([
    getDestinations(),
    getGalleryItems("travel"),
  ]);

  const years = [...new Set(items.map((item) => item.year))].sort((a, b) => b - a);

  return {
    interest: "travel",
    title: "Travel Gallery",
    subtitle: "Moments captured across borders, seasons, and slow roads.",
    defaultSort: "date-desc",
    sortOptions: [
      { id: "date-desc", label: "Date Taken" },
      { id: "date-asc", label: "Oldest First" },
      { id: "title-asc", label: "Title A–Z" },
    ],
    filterGroups: [
      {
        id: "trip",
        label: "Trips",
        type: "list",
        paramKey: "trip",
        allowAll: true,
        options: destList.map((dest) => ({
          id: dest.id,
          label: dest.title.split(",")[0] ?? dest.title,
        })),
      },
      {
        id: "year",
        label: "Year",
        type: "select",
        paramKey: "year",
        allowAll: true,
        options: years.map((year) => ({ id: String(year), label: String(year) })),
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        paramKey: "category",
        allowAll: true,
        options: Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
      },
    ],
  };
}

export function getTripGalleryHref(tripId: string): string {
  return `/gallery/travel?trip=${tripId}`;
}
