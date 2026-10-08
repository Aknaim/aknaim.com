import type { RecipeDetail } from "@/lib/types/recipe";

/** Demo recipe so the public cooking UI has something to render. Safe to delete. */
export const sampleGarlicButterPasta: RecipeDetail = {
  slug: "sample-garlic-butter-pasta",
  title: "Sample · Garlic Butter Pasta",
  date: "Mar 8, 2026",
  dateTaken: "2026-03-08",
  imageSrc: "/images/hero/peek-cooking.jpg",
  heroImage: "/images/hero/peek-cooking.jpg",
  categoryId: "dinner",
  category: "Dinner",
  cuisine: "italian",
  description:
    "A placeholder plate for layout testing — silky spaghetti, lots of garlic, and a lemon finish. Replace with a real recipe whenever you’re ready.",
  quickStats: {
    servings: 2,
    totalTime: "25m",
    difficulty: "Easy",
  },
  info: {
    cuisine: "Italian",
    course: "Dinner",
    method: "Stovetop",
    diet: "Vegetarian",
    keywords: ["Pasta", "Weeknight", "Sample"],
  },
  nutrition: {
    calories: 520,
    protein: "14g",
    carbs: "62g",
    fat: "22g",
  },
  notes:
    "Demo content only. Salt the pasta water aggressively; finish the sauce in the pan with a splash of starchy water.",
  ingredients: [
    {
      label: "Pasta",
      items: [
        { amount: "8", unit: "oz", name: "spaghetti" },
        { amount: "", unit: "to_taste", name: "kosher salt" },
      ],
    },
    {
      label: "Sauce",
      items: [
        { amount: "3", unit: "tbsp", name: "unsalted butter" },
        { amount: "4", unit: "clove", name: "garlic", note: "thinly sliced" },
        { amount: "1/4", unit: "tsp", name: "red pepper flakes" },
        { amount: "1/2", unit: "cup", name: "reserved pasta water" },
        { amount: "1", unit: "count", name: "lemon", note: "zest + juice" },
        { amount: "1/2", unit: "cup", name: "parmesan", note: "finely grated" },
        { amount: "1", unit: "handful", name: "parsley", note: "chopped" },
        { amount: "", unit: "to_taste", name: "black pepper" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Boil the pasta",
      description:
        "Bring a pot of well-salted water to a boil. Cook spaghetti until just shy of al dente. Scoop out about ½ cup pasta water, then drain.",
      imageSrc: "",
    },
    {
      number: 2,
      title: "Build the butter sauce",
      description:
        "In a wide pan over medium heat, melt the butter. Add garlic and red pepper flakes; cook until fragrant and just golden — don’t brown hard.",
      imageSrc: "",
    },
    {
      number: 3,
      title: "Emulsify",
      description:
        "Add the pasta and a splash of pasta water. Toss until glossy. Off heat, fold in lemon zest, juice, parmesan, and parsley. Season with pepper.",
      imageSrc: "",
    },
    {
      number: 4,
      title: "Serve",
      description:
        "Plate immediately with more parmesan. This is sample content — swap for your own notes when you publish a real recipe.",
      imageSrc: "",
    },
  ],
  finalResultImages: [
    { src: "/images/hero/peek-cooking.jpg", alt: "Sample garlic butter pasta plate" },
  ],
};
