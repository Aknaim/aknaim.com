import type { RecipeDetail } from "@/lib/types/recipe";

export const sourdough: RecipeDetail = {
  slug: "sourdough-boule",
  title: "Sourdough Boule",
  date: "Dec 22, 2024",
  dateTaken: "2024-12-22",
  imageSrc: "/images/hero/peek-cooking.jpg",
  heroImage: "/images/hero/peek-cooking.jpg",
  categoryId: "baking",
  category: "Baking",
  cuisine: "european",
  description:
    "75% hydration sourdough with overnight cold proof and a cast-iron Dutch oven bake.",
  quickStats: {
    servings: 1,
    totalTime: "24h",
    difficulty: "Hard",
    ovenTemp: "475°F",
  },
  info: {
    cuisine: "European",
    course: "Baking",
    method: "Dutch Oven",
    diet: "Vegan",
    keywords: ["Sourdough", "Bread", "Fermentation"],
  },
  nutrition: {
    calories: 180,
    protein: "6g",
    carbs: "36g",
    fat: "1g",
  },
  notes: "Per slice. Starter should pass the float test before mixing.",
  ingredients: [
    {
      label: "Dough",
      items: [
        { quantity: "500g", quantityMetric: "500g", name: "Bread Flour" },
        { quantity: "375ml", quantityMetric: "375ml", name: "Water" },
        { quantity: "100g", quantityMetric: "100g", name: "Active Sourdough Starter" },
        { quantity: "10g", quantityMetric: "10g", name: "Sea Salt" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Autolyse & Mix",
      description: "Combine flour and water. Rest 30 minutes, then add starter and salt.",
      imageSrc: "/images/hero/peek-cooking.jpg",
    },
    {
      number: 2,
      title: "Bulk & Shape",
      description: "Stretch and fold every 30 minutes for 3 hours. Shape and cold-proof overnight.",
      imageSrc: "/images/travel/oman/food-1.jpg",
    },
    {
      number: 3,
      title: "Bake",
      description: "Score and bake covered at 475°F for 20 minutes, uncovered 25 minutes more.",
      imageSrc: "/images/hero/peek-cooking.jpg",
    },
  ],
  finalResultImages: [
    { src: "/images/hero/peek-cooking.jpg", alt: "Sourdough boule cross section" },
  ],
};
