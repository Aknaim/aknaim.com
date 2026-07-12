import type { GalleryConfig, GalleryItem } from "@/lib/types/gallery";
import { allRecipes } from "@/lib/data/recipes";

function parseYear(dateTaken: string): number {
  return Number.parseInt(dateTaken.slice(0, 4), 10);
}

export function buildCookingGalleryItems(): GalleryItem[] {
  return allRecipes.map((recipe) => ({
    id: recipe.slug,
    src: recipe.heroImage,
    alt: recipe.title,
    title: recipe.title,
    dateTaken: recipe.dateTaken,
    year: parseYear(recipe.dateTaken),
    filters: { category: recipe.categoryId, cuisine: recipe.cuisine },
    recipeSlug: recipe.slug,
  }));
}

export const cookingGalleryItems: GalleryItem[] = buildCookingGalleryItems();

export const cookingGalleryConfig: GalleryConfig = {
  interest: "cooking",
  title: "Cooking Gallery",
  subtitle: "Browse recipes by photo — filter by category, cuisine, or date.",
  defaultSort: "date-desc",
  sortOptions: [
    { id: "date-desc", label: "Most Recent" },
    { id: "date-asc", label: "Oldest First" },
    { id: "title-asc", label: "Title A–Z" },
  ],
  filterGroups: [
    {
      id: "category",
      label: "Category",
      type: "list",
      paramKey: "category",
      allowAll: true,
      options: [
        { id: "dinner", label: "Dinner" },
        { id: "breakfast", label: "Breakfast" },
        { id: "lunch", label: "Lunch" },
        { id: "dessert", label: "Dessert" },
        { id: "baking", label: "Baking" },
        { id: "snacks", label: "Snacks" },
      ],
    },
    {
      id: "cuisine",
      label: "Cuisine",
      type: "select",
      paramKey: "cuisine",
      allowAll: true,
      options: [
        { id: "italian", label: "Italian" },
        { id: "middle-eastern", label: "Middle Eastern" },
        { id: "japanese", label: "Japanese" },
        { id: "mexican", label: "Mexican" },
        { id: "european", label: "European" },
      ],
    },
  ],
};

export { getCookingGalleryHref } from "@/lib/data/recipes";
