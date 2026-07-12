import { destinations } from "@/lib/travelData";
import type { GalleryConfig, GalleryItem } from "@/lib/types/gallery";

const TRIP_LABELS: Record<string, string> = Object.fromEntries(
  destinations.map((d) => [d.id, d.title.split(",")[0]])
);

function parseYear(date: string): number {
  const match = date.match(/\d{4}/);
  return match ? Number.parseInt(match[0], 10) : new Date().getFullYear();
}

const omanPhotos: GalleryItem[] = [
  { id: "oman-hero", src: "/images/travel/oman/hero-oman.jpg", alt: "Oman landscape at golden hour", title: "Golden Hour", dateTaken: "2025-03-02", year: 2025, filters: { trip: "oman", category: "landscapes" } },
  { id: "oman-m1", src: "/images/travel/oman/moment-1.jpg", alt: "Desert light across Wahiba Sands", title: "Desert Light", dateTaken: "2025-03-04", year: 2025, filters: { trip: "oman", category: "landscapes" } },
  { id: "oman-m2", src: "/images/travel/oman/moment-2.jpg", alt: "Stone villages in the mountains", title: "Stone Villages", dateTaken: "2025-03-06", year: 2025, filters: { trip: "oman", category: "architecture" } },
  { id: "oman-m3", src: "/images/travel/oman/moment-3.jpg", alt: "Campfire under desert stars", title: "Campfire Nights", dateTaken: "2025-03-05", year: 2025, filters: { trip: "oman", category: "portraits" } },
  { id: "oman-m4", src: "/images/travel/oman/moment-4.jpg", alt: "Coastal road along the Arabian Sea", title: "Coastal Drives", dateTaken: "2025-03-08", year: 2025, filters: { trip: "oman", category: "landscapes" } },
  { id: "oman-f1", src: "/images/travel/oman/food-1.jpg", alt: "Desert camp dinner", title: "Desert Camp", dateTaken: "2025-03-05", year: 2025, filters: { trip: "oman", category: "food" } },
  { id: "oman-f2", src: "/images/travel/oman/food-2.jpg", alt: "Lamb shuwa in Nizwa", title: "Lamb Shuwa", dateTaken: "2025-03-06", year: 2025, filters: { trip: "oman", category: "food" } },
  { id: "oman-f3", src: "/images/travel/oman/food-3.jpg", alt: "Roadside karak tea", title: "Roadside Karak", dateTaken: "2025-03-07", year: 2025, filters: { trip: "oman", category: "food" } },
  { id: "oman-gear", src: "/images/travel/oman/gear-flatlay.jpg", alt: "Travel gear flatlay", title: "Gear Flatlay", dateTaken: "2025-03-01", year: 2025, filters: { trip: "oman", category: "details" } },
  { id: "oman-route", src: "/images/travel/oman/oman-route-map.jpg", alt: "Oman route map", title: "The Route", dateTaken: "2025-03-01", year: 2025, filters: { trip: "oman", category: "details" } },
];

const CATEGORY_LABELS: Record<string, string> = {
  landscapes: "Landscapes",
  portraits: "Portraits",
  architecture: "Architecture",
  food: "Food & Dining",
  details: "Details",
  urban: "Urban",
};

const OTHER_TRIP_CATEGORIES = ["landscapes", "urban", "portraits", "architecture"] as const;

function buildDestinationPhotos(): GalleryItem[] {
  return destinations
    .filter((d) => d.id !== "oman")
    .flatMap((dest, destIndex) => {
      const year = parseYear(dest.date);
      return OTHER_TRIP_CATEGORIES.map((category, catIndex) => ({
        id: `${dest.id}-${category}`,
        src: dest.imageSrc,
        alt: `${dest.title} — ${CATEGORY_LABELS[category]}`,
        title: dest.title,
        dateTaken: `${year}-${String((destIndex % 12) + 1).padStart(2, "0")}-${String(catIndex + 1).padStart(2, "0")}`,
        year,
        filters: { trip: dest.id, category },
      }));
    });
}

export const travelGalleryItems: GalleryItem[] = [...omanPhotos, ...buildDestinationPhotos()];

export const travelGalleryConfig: GalleryConfig = {
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
      options: destinations.map((d) => ({
        id: d.id,
        label: TRIP_LABELS[d.id] ?? d.title,
      })),
    },
    {
      id: "year",
      label: "Year",
      type: "select",
      paramKey: "year",
      allowAll: true,
      options: [...new Set(travelGalleryItems.map((p) => p.year))]
        .sort((a, b) => b - a)
        .map((y) => ({ id: String(y), label: String(y) })),
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

export function getTripGalleryHref(tripId: string): string {
  return `/gallery/travel?trip=${tripId}`;
}

export { TRIP_LABELS, CATEGORY_LABELS };
