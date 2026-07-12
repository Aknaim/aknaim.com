import type { RecipeDetail } from "@/lib/types/recipe";

export const sageButterPasta: RecipeDetail = {
  slug: "sage-butter-pasta",
  title: "Handmade Pasta with Sage Butter",
  date: "Apr 18, 2025",
  dateTaken: "2025-04-18",
  imageSrc: "/images/travel/oman/food-1.jpg",
  heroImage: "/images/travel/oman/food-1.jpg",
  categoryId: "dinner",
  category: "Dinner",
  cuisine: "italian",
  description:
    "Fresh tagliatelle tossed in nutty brown butter with crispy sage leaves and Parmigiano-Reggiano.",
  quickStats: {
    servings: 4,
    totalTime: "1h 15m",
    difficulty: "Medium",
  },
  info: {
    cuisine: "Italian",
    course: "Dinner",
    method: "Stovetop",
    diet: "Vegetarian",
    keywords: ["Pasta", "Fresh", "Sage"],
  },
  nutrition: {
    calories: 420,
    protein: "14g",
    carbs: "58g",
    fat: "16g",
  },
  notes: "Use a large pot of well-salted water. Reserve pasta water for the sauce.",
  ingredients: [
    {
      label: "Pasta",
      items: [
        { quantity: "400g", quantityMetric: "400g", name: "00 Flour" },
        { quantity: "4", quantityMetric: "4", name: "Large Eggs" },
      ],
    },
    {
      label: "Sauce",
      items: [
        { quantity: "80g", quantityMetric: "80g", name: "Unsalted Butter" },
        { quantity: "Handful", quantityMetric: "Handful", name: "Fresh Sage Leaves" },
        { quantity: "50g", quantityMetric: "50g", name: "Parmigiano-Reggiano" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Make the Dough",
      description: "Mound flour, create a well, add eggs. Mix until smooth, rest 30 minutes.",
      imageSrc: "/images/travel/oman/food-1.jpg",
    },
    {
      number: 2,
      title: "Roll & Cut",
      description: "Roll dough through pasta machine to tagliatelle thickness. Cut and dust with semolina.",
      imageSrc: "/images/travel/oman/food-2.jpg",
    },
    {
      number: 3,
      title: "Brown Butter Sage",
      description: "Melt butter until nutty and golden. Fry sage leaves until crisp.",
      imageSrc: "/images/travel/oman/food-3.jpg",
    },
  ],
  finalResultImages: [
    { src: "/images/travel/oman/food-1.jpg", alt: "Sage butter pasta plated" },
  ],
};
