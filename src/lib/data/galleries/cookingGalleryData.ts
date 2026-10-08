import { RECIPE_CUISINE_OPTIONS } from "@/lib/recipe/cuisines";
import type { GalleryConfig } from "@/lib/types/gallery";

export const cookingGalleryConfig: GalleryConfig = {
  interest: "cooking",
  title: "Cooking Gallery",
  subtitle: "Plates and bakes — some with full recipes, some just the finished dish.",
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
      options: RECIPE_CUISINE_OPTIONS,
    },
  ],
};

export { getCookingGalleryHref } from "@/lib/db/queries/recipes";
