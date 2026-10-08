import {
  CLIMB_COLOR_OPTIONS,
  GALLERY_GRADE_FILTER_OPTIONS,
} from "@/lib/climbing-grades";
import { RECIPE_CUISINE_OPTIONS } from "@/lib/recipe/cuisines";
import type { GalleryInterest } from "@/lib/types/gallery";

export type GalleryFilterFieldDef = {
  key: string;
  label: string;
  options: Array<{ id: string; label: string }>;
};

/** Keep in sync with public gallery filter configs — no DB imports (client-safe). */
const COOKING_CATEGORY_OPTIONS = [
  { id: "dinner", label: "Dinner" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dessert", label: "Dessert" },
  { id: "baking", label: "Baking" },
  { id: "snacks", label: "Snacks" },
];

const COOKING_CUISINE_OPTIONS = RECIPE_CUISINE_OPTIONS;

const CLIMBING_LOCATION_OPTIONS = [
  { id: "climbers-rock", label: "Climbers Rock" },
  { id: "gravity", label: "Gravity" },
  { id: "the-hub", label: "The Hub" },
  { id: "outdoor", label: "Outdoor" },
];

const CLIMBING_TYPE_OPTIONS = [
  { id: "lead", label: "Lead" },
  { id: "bouldering", label: "Boulder" },
  { id: "top-rope", label: "Top Rope" },
];

const CLIMBING_RESULT_OPTIONS = [
  { id: "onsight", label: "Onsight" },
  { id: "flash", label: "Flash" },
  { id: "redpoint", label: "Redpoint" },
  { id: "send", label: "Send" },
  { id: "one-hang", label: "One hang" },
  { id: "project", label: "Project" },
];

const TRAVEL_CATEGORY_OPTIONS = [
  { id: "landscapes", label: "Landscapes" },
  { id: "portraits", label: "Portraits" },
  { id: "architecture", label: "Architecture" },
  { id: "food", label: "Food & Dining" },
  { id: "details", label: "Details" },
  { id: "urban", label: "Urban" },
];

/** Static filter fields per interest (travel trip options are passed in at runtime). */
export function getGalleryFilterFields(
  interest: GalleryInterest,
  travelTrips: Array<{ id: string; label: string }> = []
): GalleryFilterFieldDef[] {
  if (interest === "cooking") {
    return [
      { key: "category", label: "Category", options: COOKING_CATEGORY_OPTIONS },
      { key: "cuisine", label: "Cuisine", options: COOKING_CUISINE_OPTIONS },
    ];
  }

  if (interest === "climbing") {
    return [
      { key: "location", label: "Location", options: CLIMBING_LOCATION_OPTIONS },
      { key: "type", label: "Type", options: CLIMBING_TYPE_OPTIONS },
      { key: "result", label: "Result", options: CLIMBING_RESULT_OPTIONS },
      { key: "grade", label: "Grade", options: GALLERY_GRADE_FILTER_OPTIONS },
      {
        key: "color",
        label: "Color",
        options: CLIMB_COLOR_OPTIONS.filter((option) => option.id),
      },
    ];
  }

  return [
    { key: "trip", label: "Trip", options: travelTrips },
    { key: "category", label: "Category", options: TRAVEL_CATEGORY_OPTIONS },
  ];
}

export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  if (!base) return "";
  return base.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isGalleryInterest(value: string): value is GalleryInterest {
  return value === "climbing" || value === "travel" || value === "cooking";
}

/** Build filters object from form fields for a given interest. */
export function buildFiltersFromForm(
  interest: GalleryInterest,
  get: (key: string) => string,
  dateTaken?: string
): Record<string, string> {
  const fields = getGalleryFilterFields(interest);
  const out: Record<string, string> = {};
  for (const field of fields) {
    const value = get(field.key).trim();
    if (value) out[field.key] = value;
  }
  if (interest === "travel" && dateTaken) {
    const year = dateTaken.slice(0, 4);
    if (/^\d{4}$/.test(year)) out.year = year;
  }
  return out;
}
