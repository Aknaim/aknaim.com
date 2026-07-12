export const climbingStats = {
  sessions: 342,
  locations: 18,
  routesSent: 28,
  outdoorTrips: 3,
};

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

export interface GearItem {
  title: string;
  description: string;
}

export const climbingGearItems: GearItem[] = [
  { title: "La Sportiva Solution Comp", description: "Primary Bouldering Shoe" },
  { title: "Petzl Grigri + Caritool", description: "Belay Mechanics Assembly" },
  { title: "Edelrid Ohmega", description: "Harness" },
  { title: "Home Wall Board", description: "Moonboard 25° Setup" },
];

export { getClimbingGalleryHref } from "@/lib/data/galleries/climbingGalleryData";
