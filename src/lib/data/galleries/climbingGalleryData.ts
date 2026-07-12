import type { GalleryConfig, GalleryItem } from "@/lib/types/gallery";

const climbingPhotos: GalleryItem[] = [
  { id: "climb-1", src: "/images/hero/hero-climbing.jpg", alt: "Airfield — lead send at The Hive", title: "Airfield", dateTaken: "2025-04-12", year: 2025, duration: "0:38", filters: { location: "the-hive", type: "lead", grade: "5-12" } },
  { id: "climb-2", src: "/images/hero/hero-climbing1.jpg", alt: "Overhang circuit at Reach Climbing", title: "Overhang Circuit", dateTaken: "2025-03-28", year: 2025, duration: "0:42", filters: { location: "reach", type: "lead", grade: "5-11" } },
  { id: "climb-3", src: "/images/hero/peek-climbing.jpg", alt: "Slab dynamics boulder at home gym", title: "Slab Dynamics", dateTaken: "2025-03-15", year: 2025, duration: "0:24", filters: { location: "home-gym", type: "bouldering", grade: "v5" } },
  { id: "climb-4", src: "/images/bento/climb-thumb.jpg", alt: "Cave overhang project at The Hive", title: "Cave Overhang", dateTaken: "2025-02-20", year: 2025, duration: "0:31", filters: { location: "the-hive", type: "bouldering", grade: "v6" } },
  { id: "climb-5", src: "/images/hero/hero-climbing.jpg", alt: "Campus board training session", title: "Campus Training", dateTaken: "2025-01-14", year: 2025, duration: "0:15", filters: { location: "home-gym", type: "bouldering", grade: "v4" } },
  { id: "climb-6", src: "/images/hero/peek-climbing.jpg", alt: "Outdoor boulder at Rattlesnake Point", title: "Rattlesnake Point", dateTaken: "2024-11-03", year: 2024, duration: "0:55", filters: { location: "outdoor", type: "bouldering", grade: "v6" } },
  { id: "climb-7", src: "/images/bento/climb-thumb.jpg", alt: "Top rope warm-up at Reach", title: "Warm-up Laps", dateTaken: "2024-10-18", year: 2024, duration: "0:18", filters: { location: "reach", type: "top-rope", grade: "5-10" } },
  { id: "climb-8", src: "/images/hero/hero-climbing1.jpg", alt: "Lead attempt on 5.12 project", title: "The Hive Project", dateTaken: "2024-09-05", year: 2024, duration: "0:48", filters: { location: "the-hive", type: "lead", grade: "5-12" } },
  { id: "climb-9", src: "/images/hero/hero-climbing.jpg", alt: "Home wall endurance circuit", title: "Endurance Circuit", dateTaken: "2024-08-22", year: 2024, duration: "0:22", filters: { location: "home-gym", type: "bouldering", grade: "v4" } },
];

export const climbingGalleryItems: GalleryItem[] = climbingPhotos;

export const climbingGalleryConfig: GalleryConfig = {
  interest: "climbing",
  title: "Climbing Sessions",
  subtitle: "All gym and outdoor sessions, sends, attempts, and moments.",
  defaultSort: "date-desc",
  sortOptions: [
    { id: "date-desc", label: "Most Recent" },
    { id: "date-asc", label: "Oldest First" },
    { id: "grade-desc", label: "Hardest Grade" },
  ],
  filterGroups: [
    {
      id: "location",
      label: "Location",
      type: "list",
      paramKey: "location",
      allowAll: true,
      options: [
        { id: "home-gym", label: "Home Gym" },
        { id: "the-hive", label: "The Hive" },
        { id: "reach", label: "Reach Climbing" },
        { id: "outdoor", label: "Outdoor" },
      ],
    },
    {
      id: "type",
      label: "Type",
      type: "list",
      paramKey: "type",
      allowAll: true,
      options: [
        { id: "lead", label: "Lead" },
        { id: "bouldering", label: "Boulder" },
        { id: "top-rope", label: "Top Rope" },
      ],
    },
    {
      id: "grade",
      label: "Grade",
      type: "select",
      paramKey: "grade",
      allowAll: true,
      options: [
        { id: "v4", label: "V4" },
        { id: "v5", label: "V5" },
        { id: "v6", label: "V6" },
        { id: "5-10", label: "5.10" },
        { id: "5-11", label: "5.11" },
        { id: "5-12", label: "5.12" },
      ],
    },
  ],
};

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
