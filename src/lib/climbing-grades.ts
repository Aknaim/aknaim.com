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

/** Coarse gallery filter key (5-12, v5) from a precise grade like 5.12+. */
export function gradeFilterKey(grade: string): string {
  const normalized = grade.trim().toLowerCase().replace(/\./g, "-").replace(/\s+/g, "");

  const boulder = normalized.match(/^v(\d+)/);
  if (boulder) return `v${boulder[1]}`;

  const band = normalized.match(/^5-(1[0-3])/);
  if (band) return `5-${band[1]}`;

  const solid = normalized.match(/^5-([5-9])/);
  if (solid) return `5-${solid[1]}`;

  return normalized.replace(/[+-]$/, "");
}

/** Gallery filter options covering rope bands + common boulder grades. */
export const GALLERY_GRADE_FILTER_OPTIONS: GradeOption[] = [
  ...["5", "6", "7", "8", "9"].map((n) => ({
    id: `5-${n}`,
    label: `5.${n}`,
  })),
  ...["10", "11", "12", "13"].map((n) => ({
    id: `5-${n}`,
    label: `5.${n}`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `v${i}`,
    label: `V${i}`,
  })),
];
