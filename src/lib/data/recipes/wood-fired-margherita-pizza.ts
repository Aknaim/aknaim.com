import type { RecipeDetail } from "@/lib/types/recipe";

export const woodFiredMargheritaPizza: RecipeDetail = {
  slug: "wood-fired-margherita-pizza",
  title: "Wood Fired Margherita Pizza",
  date: "May 5, 2025",
  dateTaken: "2025-05-05",
  imageSrc: "/images/hero/peek-cooking.jpg",
  heroImage: "/images/hero/peek-cooking.jpg",
  categoryId: "dinner",
  category: "Dinner",
  cuisine: "italian",
  description:
    "A classic Neapolitan-style pizza with a blistered leopard-spotted crust, San Marzano sauce, fresh mozzarella, and basil finished in a wood-fired oven.",
  quickStats: {
    servings: 2,
    totalTime: "1h 30m",
    difficulty: "Medium",
    ovenTemp: "900°F",
  },
  info: {
    cuisine: "Italian",
    course: "Dinner",
    method: "Wood Fired",
    diet: "Vegetarian",
    keywords: ["Pizza", "Wood Fired", "Neapolitan"],
  },
  nutrition: {
    calories: 520,
    protein: "18g",
    carbs: "68g",
    fat: "18g",
  },
  notes:
    "Allow dough to come to room temperature before stretching. If you don't have a wood-fired oven, use the highest setting on a pizza stone in a home oven and broil for the last 2 minutes.",
  ingredients: [
    {
      label: "Dough",
      items: [
        { quantity: "500g", quantityMetric: "500g", name: "00 Pizza Flour" },
        { quantity: "325ml", quantityMetric: "325ml", name: "Lukewarm Water" },
        { quantity: "10g", quantityMetric: "10g", name: "Sea Salt" },
        { quantity: "3g", quantityMetric: "3g", name: "Instant Yeast" },
        { quantity: "15ml", quantityMetric: "15ml", name: "Olive Oil" },
      ],
    },
    {
      label: "Toppings",
      items: [
        { quantity: "200g", quantityMetric: "200g", name: "San Marzano Tomatoes, crushed" },
        { quantity: "250g", quantityMetric: "250g", name: "Fresh Mozzarella, torn" },
        { quantity: "Handful", quantityMetric: "Handful", name: "Fresh Basil Leaves" },
        { quantity: "2 tbsp", quantityMetric: "30ml", name: "Extra Virgin Olive Oil" },
        { quantity: "To taste", quantityMetric: "To taste", name: "Flaky Sea Salt" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Mix the Dough",
      description:
        "Combine flour, yeast, and water. Mix until shaggy, rest 20 minutes, then add salt and olive oil. Knead until smooth.",
      imageSrc: "/images/hero/peek-cooking.jpg",
    },
    {
      number: 2,
      title: "Bulk Ferment",
      description:
        "Cover and let rise at room temperature for 1–2 hours until doubled. Divide into balls and cold-proof for 24–72 hours.",
      imageSrc: "/images/travel/oman/food-1.jpg",
    },
    {
      number: 3,
      title: "Stretch & Sauce",
      description:
        "Press and stretch dough by hand. Spread a thin layer of crushed San Marzano tomatoes, leaving a raised cornicione.",
      imageSrc: "/images/travel/oman/food-2.jpg",
    },
    {
      number: 4,
      title: "Fire & Finish",
      description:
        "Launch into a 900°F oven. Rotate after 60 seconds. Add mozzarella, bake 30 seconds more. Finish with basil and olive oil.",
      imageSrc: "/images/hero/peek-cooking.jpg",
    },
  ],
  finalResultImages: [
    { src: "/images/hero/peek-cooking.jpg", alt: "Wood-fired Margherita pizza whole" },
    { src: "/images/travel/oman/food-1.jpg", alt: "Single slice with melted mozzarella" },
    { src: "/images/travel/oman/food-2.jpg", alt: "Pizza in the oven with charred crust" },
    { src: "/images/travel/oman/food-3.jpg", alt: "Close-up of blistered crust" },
  ],
};
