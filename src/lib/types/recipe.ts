export type RecipeCategoryId =
  | "dinner"
  | "breakfast"
  | "lunch"
  | "dessert"
  | "baking"
  | "snacks";

export type RecipeCuisineId =
  | "italian"
  | "middle-eastern"
  | "japanese"
  | "mexican"
  | "european";

export interface IngredientItem {
  quantity: string;
  quantityMetric: string;
  name: string;
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
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
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
    method: string;
    diet: string;
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
