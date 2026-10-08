/**
 * Shared cuisine ids for recipes + cooking gallery filters.
 * Stored as free text in Postgres — expand freely.
 */
export const RECIPE_CUISINES = [
  { id: "african", label: "African" },
  { id: "american", label: "American" },
  { id: "british", label: "British" },
  { id: "caribbean", label: "Caribbean" },
  { id: "chinese", label: "Chinese" },
  { id: "eastern-european", label: "Eastern European" },
  { id: "european", label: "European" },
  { id: "french", label: "French" },
  { id: "greek", label: "Greek" },
  { id: "indian", label: "Indian" },
  { id: "italian", label: "Italian" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "latin-american", label: "Latin American" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "mexican", label: "Mexican" },
  { id: "middle-eastern", label: "Middle Eastern" },
  { id: "north-african", label: "North African" },
  { id: "southeast-asian", label: "Southeast Asian" },
  { id: "spanish", label: "Spanish" },
  { id: "thai", label: "Thai" },
  { id: "turkish", label: "Turkish" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "fusion", label: "Fusion" },
  { id: "other", label: "Other" },
] as const;

export type RecipeCuisineId = (typeof RECIPE_CUISINES)[number]["id"];

export const RECIPE_CUISINE_OPTIONS: Array<{ id: RecipeCuisineId; label: string }> =
  RECIPE_CUISINES.map((cuisine) => ({ id: cuisine.id, label: cuisine.label }));

const CUISINE_LABELS: Record<string, string> = Object.fromEntries(
  RECIPE_CUISINES.map((cuisine) => [cuisine.id, cuisine.label])
);

export function cuisineLabel(id: string): string {
  return CUISINE_LABELS[id] ?? id;
}

export function isRecipeCuisineId(value: string): value is RecipeCuisineId {
  return value in CUISINE_LABELS;
}
