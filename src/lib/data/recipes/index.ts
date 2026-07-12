import type { CookingCategory, RecipeCategoryId, RecipeDetail, RecipeSummary } from "@/lib/types/recipe";
import { cardamomKarak } from "./cardamom-karak";
import { lambShoulder } from "./lamb-shoulder";
import { matchaTiramisu } from "./matcha-tiramisu";
import { sageButterPasta } from "./sage-butter-pasta";
import { sourdough } from "./sourdough";
import { woodFiredMargheritaPizza } from "./wood-fired-margherita-pizza";

export const allRecipes: RecipeDetail[] = [
  woodFiredMargheritaPizza,
  lambShoulder,
  sageButterPasta,
  cardamomKarak,
  sourdough,
  matchaTiramisu,
];

export const recipesMap: Record<string, RecipeDetail> = Object.fromEntries(
  allRecipes.map((recipe) => [recipe.slug, recipe])
);

export function getRecipeBySlug(slug: string): RecipeDetail | undefined {
  return recipesMap[slug];
}

export function getAllRecipes(): RecipeDetail[] {
  return allRecipes;
}

export function getRecipesByCategory(categoryId: RecipeCategoryId | "all"): RecipeDetail[] {
  if (categoryId === "all") return allRecipes;
  return allRecipes.filter((recipe) => recipe.categoryId === categoryId);
}

export function toRecipeSummary(recipe: RecipeDetail): RecipeSummary {
  const { slug, title, date, dateTaken, imageSrc, categoryId, category, cuisine, description } =
    recipe;
  return { slug, title, date, dateTaken, imageSrc, categoryId, category, cuisine, description };
}

const CATEGORY_LABELS: Record<RecipeCategoryId, string> = {
  dinner: "Dinner",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dessert: "Dessert",
  baking: "Baking",
  snacks: "Snacks",
};

export function getCookingCategories(): CookingCategory[] {
  const counts = allRecipes.reduce(
    (acc, recipe) => {
      acc[recipe.categoryId] = (acc[recipe.categoryId] ?? 0) + 1;
      return acc;
    },
    {} as Record<RecipeCategoryId, number>
  );

  return (Object.keys(CATEGORY_LABELS) as RecipeCategoryId[]).map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    count: counts[id] ?? 0,
  }));
}

export const cookingStats = {
  recipes: allRecipes.length,
  categories: getCookingCategories().filter((c) => c.count > 0).length,
  cuisines: new Set(allRecipes.map((r) => r.cuisine)).size,
  years: new Set(allRecipes.map((r) => r.dateTaken.slice(0, 4))).size,
};

export interface GearItem {
  title: string;
  description: string;
}

export const cookingGearItems: GearItem[] = [
  { title: "Gozney Roccbox", description: "High-Heat Outdoor Propane Oven" },
  { title: "Lodge 12-Inch Cast Iron Skillet", description: "Heat Retention Baseline" },
  { title: "Infrared Thermometer", description: "Oven Floor Calibration" },
  { title: "Kitchen Scale", description: "Baker's Percentage Weighing" },
];

export function getRecipeHref(slug: string): string {
  return `/cooking/${slug}`;
}

export function getCookingGalleryHref(filters?: {
  category?: string;
  cuisine?: string;
}): string {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.cuisine) params.set("cuisine", filters.cuisine);
  const qs = params.toString();
  return qs ? `/gallery/cooking?${qs}` : "/gallery/cooking";
}
