import type { RecipeDetail } from "@/lib/types/recipe";

export const cardamomKarak: RecipeDetail = {
  slug: "cardamom-karak",
  title: "Cardamom Karak",
  date: "Apr 12, 2025",
  dateTaken: "2025-04-12",
  imageSrc: "/images/travel/oman/food-3.jpg",
  heroImage: "/images/travel/oman/food-3.jpg",
  categoryId: "breakfast",
  category: "Breakfast",
  cuisine: "middle-eastern",
  description:
    "Strong black tea simmered with cardamom and evaporated milk — the Gulf's answer to chai.",
  quickStats: {
    servings: 2,
    totalTime: "15m",
    difficulty: "Easy",
  },
  info: {
    cuisine: "Middle Eastern",
    course: "Breakfast",
    method: "Stovetop",
    diet: "Vegetarian",
    keywords: ["Tea", "Karak", "Cardamom"],
  },
  nutrition: {
    calories: 120,
    protein: "4g",
    carbs: "14g",
    fat: "6g",
  },
  notes: "Pour between two pots from height to create froth — the traditional technique.",
  ingredients: [
    {
      label: "Main",
      items: [
        { quantity: "2 cups", quantityMetric: "480ml", name: "Water" },
        { quantity: "2 tbsp", quantityMetric: "30g", name: "Black Tea Leaves" },
        { quantity: "4 pods", quantityMetric: "4 pods", name: "Green Cardamom, crushed" },
        { quantity: "1/2 cup", quantityMetric: "120ml", name: "Evaporated Milk" },
        { quantity: "2 tbsp", quantityMetric: "30g", name: "Sugar" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Simmer Tea",
      description: "Boil water with cardamom and tea leaves for 5 minutes until deeply coloured.",
      imageSrc: "/images/travel/oman/food-3.jpg",
    },
    {
      number: 2,
      title: "Add Milk & Froth",
      description: "Stir in milk and sugar. Pour between pots to froth. Strain and serve hot.",
      imageSrc: "/images/travel/oman/food-3.jpg",
    },
  ],
  finalResultImages: [
    { src: "/images/travel/oman/food-3.jpg", alt: "Cardamom karak in glass" },
  ],
};
