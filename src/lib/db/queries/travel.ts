import { asc, count, eq, sql } from "drizzle-orm";
import { dateSortKey, formatMonthYear, isIsoDate } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  destinations,
  galleryItems,
  mediaAssets,
  tripFavoritePlaces,
  tripFieldNotes,
  tripMoments,
  tripRouteStops,
  trips,
} from "@/lib/db/schema";
import type { Destination } from "@/lib/travelData";
import type { GalleryConfig, GalleryItem } from "@/lib/types/gallery";
import type { TripDetail } from "@/lib/types/travel";

export type { Destination };

const CATEGORY_LABELS: Record<string, string> = {
  landscapes: "Landscapes",
  portraits: "Portraits",
  architecture: "Architecture",
  food: "Food & Dining",
  details: "Details",
  urban: "Urban",
};

function formatCount(n: number): string {
  if (n >= 1000) {
    const rounded = Math.round(n / 100) / 10;
    return `${rounded}k+`;
  }
  return String(n);
}

function displayTravelDate(label: string): string {
  return isIsoDate(label) ? formatMonthYear(label) : label;
}

function versioned(url: string | undefined, createdAt: Date | string | null | undefined): string {
  if (!url) return "";
  if (createdAt == null) return url;
  const ms = new Date(createdAt).getTime();
  if (Number.isNaN(ms)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${ms}`;
}

/** Homepage metrics — places/photos/days from live rows; memories stays ∞. */
export async function getTravelStats() {
  const [placesRow, photosRow, daysRow] = await Promise.all([
    db.select({ value: count() }).from(destinations),
    db
      .select({ value: count() })
      .from(galleryItems)
      .where(eq(galleryItems.interest, "travel")),
    db.select({ value: sql<number>`coalesce(sum(${trips.statDays}), 0)` }).from(trips),
  ]);

  return {
    places: placesRow[0]?.value ?? 0,
    photos: formatCount(photosRow[0]?.value ?? 0),
    notes: String(daysRow[0]?.value ?? 0),
    memories: "∞",
  };
}

export async function countDestinations(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(destinations);
  return row?.value ?? 0;
}

async function galleryCountsByTrip(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      tripId: sql<string>`${galleryItems.filters}->>'trip'`,
      value: count(),
    })
    .from(galleryItems)
    .where(eq(galleryItems.interest, "travel"))
    .groupBy(sql`${galleryItems.filters}->>'trip'`);

  const map = new Map<string, number>();
  for (const row of rows) {
    if (row.tripId) map.set(row.tripId, row.value);
  }
  return map;
}

export async function getDestinations(): Promise<Destination[]> {
  const [rows, tripRows, photoCounts] = await Promise.all([
    db
      .select({
        id: destinations.id,
        number: destinations.displayNumber,
        title: destinations.title,
        subtitle: destinations.subtitle,
        date: destinations.dateLabel,
        imageSrc: mediaAssets.url,
        imageCreatedAt: mediaAssets.createdAt,
        mapX: destinations.mapX,
        mapY: destinations.mapY,
      })
      .from(destinations)
      .innerJoin(mediaAssets, eq(destinations.imageMediaId, mediaAssets.id)),
    db.select({ id: trips.id }).from(trips),
    galleryCountsByTrip(),
  ]);

  const tripIds = new Set(tripRows.map((row) => row.id));

  return rows
    .map((row) => ({
      id: row.id,
      number: row.number,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      photosCount: photoCounts.get(row.id) ?? 0,
      notesCount: 0,
      date: displayTravelDate(row.date),
      sortKey: dateSortKey(row.date),
      imageSrc: versioned(row.imageSrc, row.imageCreatedAt),
      mapCoordinates: { x: row.mapX, y: row.mapY },
      hasDetail: tripIds.has(row.id),
    }))
    .sort((a, b) => b.sortKey - a.sortKey)
    .map(({ sortKey: _sortKey, ...dest }) => dest);
}

export async function getTripById(id: string): Promise<TripDetail | null> {
  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip) return null;

  const [hero] = await db
    .select({ url: mediaAssets.url, createdAt: mediaAssets.createdAt })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, trip.heroMediaId))
    .limit(1);
  const [routeMap] = await db
    .select({ url: mediaAssets.url, createdAt: mediaAssets.createdAt })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, trip.routeMapMediaId))
    .limit(1);
  const [gear] = await db
    .select({ url: mediaAssets.url, createdAt: mediaAssets.createdAt })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, trip.gearMediaId))
    .limit(1);

  const [stops, moments, notes, places, photoCountRow] = await Promise.all([
    db
      .select()
      .from(tripRouteStops)
      .where(eq(tripRouteStops.tripId, id))
      .orderBy(asc(tripRouteStops.sortOrder)),
    db
      .select({
        title: tripMoments.title,
        photoCount: tripMoments.photoCount,
        imageSrc: mediaAssets.url,
      })
      .from(tripMoments)
      .innerJoin(mediaAssets, eq(tripMoments.imageMediaId, mediaAssets.id))
      .where(eq(tripMoments.tripId, id))
      .orderBy(asc(tripMoments.sortOrder)),
    db
      .select({ noteText: tripFieldNotes.noteText })
      .from(tripFieldNotes)
      .where(eq(tripFieldNotes.tripId, id))
      .orderBy(asc(tripFieldNotes.sortOrder)),
    db
      .select({
        title: tripFavoritePlaces.title,
        location: tripFavoritePlaces.location,
        description: tripFavoritePlaces.description,
        imageSrc: mediaAssets.url,
      })
      .from(tripFavoritePlaces)
      .innerJoin(mediaAssets, eq(tripFavoritePlaces.imageMediaId, mediaAssets.id))
      .where(eq(tripFavoritePlaces.tripId, id))
      .orderBy(asc(tripFavoritePlaces.sortOrder)),
    db
      .select({ value: count() })
      .from(galleryItems)
      .where(
        sql`${galleryItems.interest} = 'travel' AND ${galleryItems.filters}->>'trip' = ${id}`
      ),
  ]);

  return {
    id: trip.id,
    country: trip.country,
    date: displayTravelDate(trip.dateLabel),
    summary: trip.summary,
    heroImage: versioned(hero?.url, hero?.createdAt),
    stats: {
      days: trip.statDays,
      stops: stops.length,
      photos: photoCountRow[0]?.value ?? 0,
    },
    route: {
      mapImage: versioned(routeMap?.url, routeMap?.createdAt),
      note: trip.routeNote ?? "",
      stops: stops.map((stop) => ({
        name: stop.name,
        coordinates: { x: stop.coordX, y: stop.coordY },
      })),
    },
    timeline: [],
    moments,
    fieldNotes: notes.map((note) => note.noteText),
    favoritePlaces: places,
    gearImage: versioned(gear?.url, gear?.createdAt),
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

export async function getTravelGalleryConfig(
  items: Pick<GalleryItem, "year">[] = []
): Promise<GalleryConfig> {
  const destList = await getDestinations();

  const years = [...new Set(items.map((item) => item.year))].sort((a, b) => b - a);

  return {
    interest: "travel",
    title: "Travel Gallery",
    subtitle: "Moments captured across borders, seasons, and slow roads.",
    defaultSort: "date-asc",
    sortOptions: [
      { id: "date-asc", label: "Oldest First" },
      { id: "date-desc", label: "Most Recent" },
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
