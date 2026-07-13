import type { GalleryConfig } from "@/lib/types/gallery";

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

export { getCookingGalleryHref } from "@/lib/db/queries/recipes";
