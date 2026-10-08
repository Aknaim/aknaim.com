import type { RecipeCuisineId } from "@/lib/recipe/cuisines";
import type { IngredientUnitId } from "@/lib/recipe/units";

export type { RecipeCuisineId } from "@/lib/recipe/cuisines";

export type RecipeCategoryId =
  | "dinner"
  | "breakfast"
  | "lunch"
  | "dessert"
  | "baking"
  | "snacks";

export interface IngredientItem {
  /** Numeric/fraction amount, or freeform text when unit is `text`. */
  amount: string;
  unit: IngredientUnitId;
  name: string;
  /** Prep note, e.g. "finely chopped". */
  note?: string;
}

export interface IngredientGroup {
  label: string;
  items: IngredientItem[];
}

export interface RecipeStep {
  number: number;
  title: string;
  description: string;
  imageSrc: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface RecipeQuickStats {
  servings: number;
  totalTime: string;
  difficulty: string;
  ovenTemp?: string;
}

export interface RecipeSummary {
  slug: string;
  title: string;
  date: string;
  dateTaken: string;
  imageSrc: string;
  categoryId: RecipeCategoryId;
  category: string;
  cuisine: RecipeCuisineId;
  description: string;
}

export interface RecipeDetail extends RecipeSummary {
  heroImage: string;
  quickStats: RecipeQuickStats;
  info: {
    cuisine: string;
    course: string;
    method?: string;
    diet?: string;
    keywords: string[];
  };
  nutrition: RecipeNutrition;
  notes: string;
  ingredients: IngredientGroup[];
  steps: RecipeStep[];
  finalResultImages: { src: string; alt: string }[];
}

export interface CookingCategory {
  id: RecipeCategoryId;
  label: string;
  count: number;
}
