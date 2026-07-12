import type { RecipeDetail } from "@/lib/types/recipe";

export const matchaTiramisu: RecipeDetail = {
  slug: "matcha-tiramisu",
  title: "Matcha Tiramisu",
  date: "Sep 18, 2024",
  dateTaken: "2024-09-18",
  imageSrc: "/images/travel/oman/food-3.jpg",
  heroImage: "/images/travel/oman/food-3.jpg",
  categoryId: "dessert",
  category: "Dessert",
  cuisine: "japanese",
  description:
    "Layered mascarpone cream with ceremonial-grade matcha and espresso-soaked ladyfingers.",
  quickStats: {
    servings: 8,
    totalTime: "4h",
    difficulty: "Medium",
  },
  info: {
    cuisine: "Japanese",
    course: "Dessert",
    method: "No Bake",
    diet: "Vegetarian",
    keywords: ["Matcha", "Tiramisu", "Dessert"],
  },
  nutrition: {
    calories: 340,
    protein: "6g",
    carbs: "32g",
    fat: "22g",
  },
  notes: "Chill at least 4 hours. Dust with matcha just before serving.",
  ingredients: [
    {
      label: "Main",
      items: [
        { quantity: "500g", quantityMetric: "500g", name: "Mascarpone" },
        { quantity: "3", quantityMetric: "3", name: "Egg Yolks" },
        { quantity: "2 tbsp", quantityMetric: "15g", name: "Ceremonial Matcha" },
        { quantity: "200ml", quantityMetric: "200ml", name: "Espresso, cooled" },
        { quantity: "24", quantityMetric: "24", name: "Ladyfinger Biscuits" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Make Cream",
      description: "Whisk yolks with sugar until pale. Fold in mascarpone and sifted matcha.",
      imageSrc: "/images/travel/oman/food-3.jpg",
    },
    {
      number: 2,
      title: "Layer & Chill",
      description: "Dip ladyfingers in espresso. Alternate layers of biscuits and cream. Chill 4 hours.",
      imageSrc: "/images/travel/oman/food-2.jpg",
    },
  ],
  finalResultImages: [
    { src: "/images/travel/oman/food-3.jpg", alt: "Matcha tiramisu slice" },
  ],
};
