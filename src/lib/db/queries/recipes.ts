import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  gearItems,
  ingredientGroups,
  ingredients,
  mediaAssets,
  recipeFinalImages,
  recipeSteps,
  recipes,
} from "@/lib/db/schema";
import type {
  CookingCategory,
  RecipeCategoryId,
  RecipeDetail,
  RecipeSummary,
} from "@/lib/types/recipe";

const CATEGORY_LABELS: Record<RecipeCategoryId, string> = {
  dinner: "Dinner",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dessert: "Dessert",
  baking: "Baking",
  snacks: "Snacks",
};

export async function getAllRecipes(): Promise<RecipeDetail[]> {
  const rows = await db
    .select()
    .from(recipes)
    .where(eq(recipes.published, true))
    .orderBy(asc(recipes.dateTaken));

  const details = await Promise.all(rows.map((row) => hydrateRecipe(row.slug)));
  return details.filter((recipe): recipe is RecipeDetail => recipe !== null);
}

export async function getRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  return hydrateRecipe(slug);
}

export async function getRecipeSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: recipes.slug })
    .from(recipes)
    .where(eq(recipes.published, true));
  return rows.map((row) => row.slug);
}

export async function getCookingStats() {
  const all = await getAllRecipes();
  return {
    recipes: all.length,
    categories: new Set(all.map((r) => r.categoryId)).size,
    cuisines: new Set(all.map((r) => r.cuisine)).size,
    years: new Set(all.map((r) => r.dateTaken.slice(0, 4))).size,
  };
}

export async function getCookingGearItems() {
  return db
    .select({
      title: gearItems.title,
      description: gearItems.description,
    })
    .from(gearItems)
    .where(eq(gearItems.interest, "cooking"))
    .orderBy(asc(gearItems.sortOrder));
}

export async function getCookingCategories(): Promise<CookingCategory[]> {
  const all = await getAllRecipes();
  const counts = all.reduce(
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

export function toRecipeSummary(recipe: RecipeDetail): RecipeSummary {
  const { slug, title, date, dateTaken, imageSrc, categoryId, category, cuisine, description } =
    recipe;
  return { slug, title, date, dateTaken, imageSrc, categoryId, category, cuisine, description };
}

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

async function hydrateRecipe(slug: string): Promise<RecipeDetail | null> {
  const [row] = await db.select().from(recipes).where(eq(recipes.slug, slug)).limit(1);
  if (!row || !row.published) return null;

  const [imageRow] = await db
    .select({ url: mediaAssets.url })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, row.imageMediaId))
    .limit(1);
  const [heroRow] = await db
    .select({ url: mediaAssets.url })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, row.heroMediaId))
    .limit(1);

  const groups = await db
    .select()
    .from(ingredientGroups)
    .where(eq(ingredientGroups.recipeSlug, slug))
    .orderBy(asc(ingredientGroups.sortOrder));

  const ingredientsByGroup = await Promise.all(
    groups.map(async (group) => {
      const items = await db
        .select()
        .from(ingredients)
        .where(eq(ingredients.groupId, group.id))
        .orderBy(asc(ingredients.sortOrder));
      return {
        label: group.label,
        items: items.map((item) => ({
          quantity: item.quantity,
          quantityMetric: item.quantityMetric,
          name: item.name,
        })),
      };
    })
  );

  const steps = await db
    .select({
      step: recipeSteps,
      imageUrl: mediaAssets.url,
    })
    .from(recipeSteps)
    .leftJoin(mediaAssets, eq(recipeSteps.imageMediaId, mediaAssets.id))
    .where(eq(recipeSteps.recipeSlug, slug))
    .orderBy(asc(recipeSteps.stepNumber));

  const finals = await db
    .select({
      alt: recipeFinalImages.alt,
      url: mediaAssets.url,
      sortOrder: recipeFinalImages.sortOrder,
    })
    .from(recipeFinalImages)
    .innerJoin(mediaAssets, eq(recipeFinalImages.mediaAssetId, mediaAssets.id))
    .where(eq(recipeFinalImages.recipeSlug, slug))
    .orderBy(asc(recipeFinalImages.sortOrder));

  return {
    slug: row.slug,
    title: row.title,
    date: row.dateLabel,
    dateTaken: String(row.dateTaken),
    imageSrc: imageRow?.url ?? "",
    heroImage: heroRow?.url ?? "",
    categoryId: row.categoryId as RecipeCategoryId,
    category: row.categoryLabel,
    cuisine: row.cuisine as RecipeDetail["cuisine"],
    description: row.description,
    quickStats: {
      servings: row.servings,
      totalTime: row.totalTime,
      difficulty: row.difficulty,
      ovenTemp: row.ovenTemp ?? undefined,
    },
    info: {
      cuisine: row.infoCuisine,
      course: row.infoCourse,
      method: row.infoMethod,
      diet: row.infoDiet,
      keywords: row.keywords,
    },
    nutrition: {
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
    },
    notes: row.notes,
    ingredients: ingredientsByGroup,
    steps: steps.map(({ step, imageUrl }) => ({
      number: step.stepNumber,
      title: step.title,
      description: step.description,
      imageSrc: imageUrl ?? "",
    })),
    finalResultImages: finals.map((image) => ({
      src: image.url,
      alt: image.alt,
    })),
  };
}
