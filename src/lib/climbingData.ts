export type ProjectStatus = "in-progress" | "projecting" | "on-deck";

export interface ClimbingProject {
  id: string;
  grade: string;
  name: string;
  location: string;
  locationId: string;
  type: "lead" | "bouldering" | "top-rope";
  status: ProjectStatus;
  imageSrc: string;
}

export interface RecentSend {
  id: string;
  grade: string;
  routeName: string;
  location: string;
  locationId: string;
  type: "lead" | "bouldering" | "top-rope";
  date: string;
  duration: string;
  imageSrc: string;
}

export interface ProgressionMilestone {
  year: string;
  label: string;
}

export interface GearItem {
  title: string;
  description: string;
}

/** Used by the DB seed script. Prefer `@/lib/db/queries/climbing` in pages. */
export const climbingStats = {
  sessions: 342,
  locations: 18,
  routesSent: 28,
  outdoorTrips: 3,
};

export const climbingProjects: ClimbingProject[] = [
  {
    id: "proj-1",
    grade: "5.12b/12c",
    name: "The Hive — Lead",
    location: "The Hive",
    locationId: "the-hive",
    type: "lead",
    status: "in-progress",
    imageSrc: "/images/hero/hero-climbing.jpg",
  },
  {
    id: "proj-2",
    grade: "V6",
    name: "Home Wall Project",
    location: "Home Gym",
    locationId: "home-gym",
    type: "bouldering",
    status: "projecting",
    imageSrc: "/images/hero/peek-climbing.jpg",
  },
  {
    id: "proj-3",
    grade: "5.11d",
    name: "Reach — Top Rope",
    location: "Reach Climbing",
    locationId: "reach",
    type: "top-rope",
    status: "on-deck",
    imageSrc: "/images/hero/hero-climbing1.jpg",
  },
  {
    id: "proj-4",
    grade: "V5",
    name: "Cave Overhang",
    location: "The Hive",
    locationId: "the-hive",
    type: "bouldering",
    status: "projecting",
    imageSrc: "/images/bento/climb-thumb.jpg",
  },
];

export const recentSends: RecentSend[] = [
  {
    id: "send-1",
    grade: "5.12a",
    routeName: "Airfield",
    location: "The Hive",
    locationId: "the-hive",
    type: "lead",
    date: "Apr 12, 2025",
    duration: "0:38",
    imageSrc: "/images/hero/hero-climbing.jpg",
  },
  {
    id: "send-2",
    grade: "V5",
    routeName: "Slab Dynamics",
    location: "Home Gym",
    locationId: "home-gym",
    type: "bouldering",
    date: "Mar 28, 2025",
    duration: "0:24",
    imageSrc: "/images/hero/peek-climbing.jpg",
  },
  {
    id: "send-3",
    grade: "5.11b",
    routeName: "Overhang Circuit",
    location: "Reach Climbing",
    locationId: "reach",
    type: "lead",
    date: "Mar 15, 2025",
    duration: "0:42",
    imageSrc: "/images/bento/climb-thumb.jpg",
  },
];

export const progressionTimeline: ProgressionMilestone[] = [
  { year: "2022", label: "First 5.11" },
  { year: "2023", label: "First V5" },
  { year: "2024", label: "First 5.12a" },
  { year: "May 2024", label: "First 5.12a Lead" },
  { year: "2025", label: "Projecting 5.12c" },
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  "in-progress": "In Progress",
  projecting: "Projecting",
  "on-deck": "On Deck",
};

export const climbingGearItems: GearItem[] = [
  { title: "La Sportiva Solution Comp", description: "Primary Bouldering Shoe" },
  { title: "Petzl Grigri + Caritool", description: "Belay Mechanics Assembly" },
  { title: "Edelrid Ohmega", description: "Harness" },
  { title: "Home Wall Board", description: "Moonboard 25° Setup" },
];

/** Used by the DB seed script. Prefer `getGalleryItems("climbing")` in pages. */
export const climbingGallerySeedItems = [
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

export { getClimbingGalleryHref } from "@/lib/db/queries/climbing";
