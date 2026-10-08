export type CourseInterest = "photography" | "cooking" | "carpentry";

export interface CourseSession {
  label: string;
  /** Dishes, assignment themes, techniques covered */
  items: string[];
}

/** Photo tied to a course, optionally nested under a session assignment label. */
export interface CourseOutcomePhoto {
  src: string;
  alt: string;
  /** Must match a `sessions[].items[]` string to nest under that assignment */
  assignment?: string;
}

export interface CourseDefinition {
  id: string;
  interest: CourseInterest;
  title: string;
  code?: string;
  school: string;
  href?: string;
  blurb?: string;
  /** Contact hours from the school catalog (e.g. George Brown CE). */
  hours?: number;
  /** Expandable weeks / assignments */
  sessions: CourseSession[];
  /**
   * Trial / future admin-linked outcomes. Shown under the matching assignment
   * when expanded; unassigned photos appear at the bottom of the course.
   */
  outcomes?: CourseOutcomePhoto[];
}

export interface Course extends CourseDefinition {
  /** ISO start date from admin, when set */
  startedOn: string | null;
  /** ISO end / completed date from admin, when set */
  completedOn: string | null;
}
