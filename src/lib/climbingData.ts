import { gradeFilterKey } from "@/lib/climbing-grades";

export type ProjectStatus = "in-progress" | "projecting" | "on-deck";
export type ClimbType = "lead" | "bouldering" | "top-rope";
/**
 * onsight = first try, no beta
 * flash = first try with beta
 * redpoint = clean send after prior attempts
 * send = clean send, style unspecified
 * one-hang = finished after falling/hanging (not a clean send)
 * project = not finished yet
 */
export type ClimbResult =
  | "onsight"
  | "flash"
  | "redpoint"
  | "send"
  | "one-hang"
  | "project";

export interface ClimbingProject {
  id: string;
  grade: string;
  name: string;
  location: string;
  locationId: string;
  type: ClimbType;
  status: ProjectStatus;
  imageSrc: string;
}

export interface RecentSend {
  id: string;
  slug: string;
  grade: string;
  routeName: string;
  location: string;
  locationId: string;
  type: ClimbType;
  color: string | null;
  result: ClimbResult;
  sessionDate: string;
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

/** @deprecated Prefer computed stats from sessions/sends. */
export const climbingStats = {
  sessions: 0,
  locations: 0,
  routesSent: 0,
  outdoorTrips: 0,
};

const HALLOWEEN_GREEN = {
  slug: "halloween-green",
  title: "Halloween",
  grade: "5.12",
  locationId: "climbers-rock",
  locationName: "ClimbersRock",
  type: "top-rope" as const,
  color: "green",
  result: "one-hang" as const,
  dateTaken: "2025-10-31",
  dateLabel: "Oct 31, 2025",
  mediaBase: "/media/climbing/halloween-green",
};

/**
 * Active projects only (still working). Completed climbs live in recentSends / gallery.
 * Halloween was a one-hang finish — not a current project.
 */
export const climbingProjects: ClimbingProject[] = [];

/** Recent sends — thumb uses still.webp; send.mp4 lives in the gallery */
export const recentSends: RecentSend[] = [
  {
    id: `send-${HALLOWEEN_GREEN.slug}`,
    slug: HALLOWEEN_GREEN.slug,
    grade: HALLOWEEN_GREEN.grade,
    routeName: HALLOWEEN_GREEN.title,
    location: HALLOWEEN_GREEN.locationName,
    locationId: HALLOWEEN_GREEN.locationId,
    type: HALLOWEEN_GREEN.type,
    color: HALLOWEEN_GREEN.color,
    result: HALLOWEEN_GREEN.result,
    sessionDate: HALLOWEEN_GREEN.dateTaken,
    date: HALLOWEEN_GREEN.dateLabel,
    duration: "0:38",
    imageSrc: `${HALLOWEEN_GREEN.mediaBase}/still.jpg`,
  },
];

/** Seed-only. Live page uses BASELINE_PROGRESSION + inferred climb dates. */
export const progressionTimeline: ProgressionMilestone[] = [
  { year: "May 5, 2024", label: "Started membership" },
  { year: "Jun 6, 2024", label: "Started top rope" },
  { year: "Jun 11, 2024", label: "First V5" },
  { year: "Jul 18, 2024", label: "First 5.11+" },
  { year: "Aug 28, 2024", label: "First 5.12-" },
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  "in-progress": "In Progress",
  projecting: "Projecting",
  "on-deck": "On Deck",
};

export const RESULT_LABELS: Record<ClimbResult, string> = {
  onsight: "Onsight",
  flash: "Flash",
  redpoint: "Redpoint",
  send: "Send",
  "one-hang": "One hang",
  project: "Project",
};

export const climbingGearItems: GearItem[] = [
  { title: "La Sportiva Solution Comp", description: "Primary Shoe" },
  { title: "Arc'teryx Chalk Bag", description: "Chalk Bag" },
  { title: "Black Diamond Momentum", description: "Harness" },
  { title: "Petzl Grigri", description: "Belay Device" },
  { title: "Edelrid Ohmega", description: "Belay Assist" },
  { title: "Mammut Neon 55", description: "Backpack" },
  { title: "Mammut Crag Sender", description: "Helmet" },
  { title: "Petzl Aria 2R RGB", description: "Headlamp" },
  { title: "Mammut 9.5 Crag We Care Classic", description: "Rope" },
];

/**
 * Climbing gallery — 3 assets per climb folder:
 *   still.webp (poster/thumb), grade.webp, send.mp4
 */
export const climbingGallerySeedItems: Array<{
  id: string;
  src: string;
  alt: string;
  title: string;
  dateTaken: string;
  year: number;
  duration?: string;
  mediaType?: "image" | "video";
  posterSrc?: string;
  filters: Record<string, string>;
}> = [
  {
    id: `climb-${HALLOWEEN_GREEN.slug}-still`,
    src: `${HALLOWEEN_GREEN.mediaBase}/still.jpg`,
    alt: `${HALLOWEEN_GREEN.title} still — ${HALLOWEEN_GREEN.locationName}`,
    title: HALLOWEEN_GREEN.title,
    dateTaken: HALLOWEEN_GREEN.dateTaken,
    year: 2025,
    filters: {
      location: HALLOWEEN_GREEN.locationId,
      type: HALLOWEEN_GREEN.type,
      grade: gradeFilterKey(HALLOWEEN_GREEN.grade),
      color: HALLOWEEN_GREEN.color,
      result: HALLOWEEN_GREEN.result,
      climb: HALLOWEEN_GREEN.slug,
    },
  },
  {
    id: `climb-${HALLOWEEN_GREEN.slug}-grade`,
    src: `${HALLOWEEN_GREEN.mediaBase}/grade.jpg`,
    alt: `${HALLOWEEN_GREEN.title} — grade`,
    title: HALLOWEEN_GREEN.title,
    dateTaken: HALLOWEEN_GREEN.dateTaken,
    year: 2025,
    filters: {
      location: HALLOWEEN_GREEN.locationId,
      type: HALLOWEEN_GREEN.type,
      grade: gradeFilterKey(HALLOWEEN_GREEN.grade),
      color: HALLOWEEN_GREEN.color,
      result: HALLOWEEN_GREEN.result,
      climb: HALLOWEEN_GREEN.slug,
    },
  },
  {
    id: `climb-${HALLOWEEN_GREEN.slug}-send`,
    src: `${HALLOWEEN_GREEN.mediaBase}/send.mp4`,
    alt: `${HALLOWEEN_GREEN.title} — send`,
    title: HALLOWEEN_GREEN.title,
    dateTaken: HALLOWEEN_GREEN.dateTaken,
    year: 2025,
    duration: "0:38",
    mediaType: "video",
    posterSrc: `${HALLOWEEN_GREEN.mediaBase}/still.jpg`,
    filters: {
      location: HALLOWEEN_GREEN.locationId,
      type: HALLOWEEN_GREEN.type,
      grade: gradeFilterKey(HALLOWEEN_GREEN.grade),
      color: HALLOWEEN_GREEN.color,
      result: HALLOWEEN_GREEN.result,
      climb: HALLOWEEN_GREEN.slug,
    },
  },
];

export { getClimbingGalleryHref } from "@/lib/db/queries/climbing";
