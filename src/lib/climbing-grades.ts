export type ClimbType = "lead" | "top-rope" | "bouldering";

export type GradeOption = {
  id: string;
  label: string;
};

/** Gym hold/tape colors (empty id = none / outdoor). */
export const CLIMB_COLOR_OPTIONS: GradeOption[] = [
  { id: "", label: "None" },
  { id: "green", label: "Green" },
  { id: "orange", label: "Orange" },
  { id: "purple", label: "Purple" },
  { id: "blue", label: "Blue" },
  { id: "yellow", label: "Yellow" },
  { id: "red", label: "Red" },
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
  { id: "pink", label: "Pink" },
];

/** Solid YDS through 5.9, then -/flat/+ bands from 5.10 to 5.13+ (gym style). */
const ROPE_GRADES: GradeOption[] = [
  { id: "5.5", label: "5.5" },
  { id: "5.6", label: "5.6" },
  { id: "5.7", label: "5.7" },
  { id: "5.8", label: "5.8" },
  { id: "5.9", label: "5.9" },
  ...(["10", "11", "12", "13"] as const).flatMap((n) => [
    { id: `5.${n}-`, label: `5.${n}-` },
    { id: `5.${n}`, label: `5.${n}` },
    { id: `5.${n}+`, label: `5.${n}+` },
  ]),
];

const BOULDER_GRADES: GradeOption[] = Array.from({ length: 11 }, (_, i) => ({
  id: `V${i}`,
  label: `V${i}`,
}));

export function gradesForClimbType(type: ClimbType): GradeOption[] {
  return type === "bouldering" ? BOULDER_GRADES : ROPE_GRADES;
}

/**
 * Gallery filter key from a precise grade.
 * Keeps sub-grades: 5.12- → 5-12-, 5.12+ → 5-12+, V5 → v5.
 */
export function gradeFilterKey(grade: string): string {
  const normalized = grade.trim().toLowerCase().replace(/\./g, "-").replace(/\s+/g, "");

  const boulder = normalized.match(/^v(\d+)/);
  if (boulder) return `v${boulder[1]}`;

  const rope = normalized.match(/^5-(\d{1,2})([+-])?/);
  if (rope) return `5-${rope[1]}${rope[2] ?? ""}`;

  return normalized;
}

/** Convert a gallery grade filter key back to a display/parseable grade (5-12- → 5.12-). */
export function gradeFromFilterKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  const boulder = normalized.match(/^v(\d+)$/);
  if (boulder) return `V${boulder[1]}`;

  const rope = normalized.match(/^5-(\d{1,2})([+-])?$/);
  if (rope) return `5.${rope[1]}${rope[2] ?? ""}`;

  return key;
}

/** Gallery filter options with -/flat/+ rope bands + boulder grades. */
export const GALLERY_GRADE_FILTER_OPTIONS: GradeOption[] = [
  ...ROPE_GRADES.map((grade) => ({
    id: gradeFilterKey(grade.id),
    label: grade.label,
  })),
  ...BOULDER_GRADES.map((grade) => ({
    id: gradeFilterKey(grade.id),
    label: grade.label,
  })),
];
