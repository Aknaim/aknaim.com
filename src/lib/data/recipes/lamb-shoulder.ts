import type { RecipeDetail } from "@/lib/types/recipe";

export const lambShoulder: RecipeDetail = {
  slug: "lamb-shoulder",
  title: "Slow Cooked Lamb Shoulder",
  date: "Apr 27, 2025",
  dateTaken: "2025-04-27",
  imageSrc: "/images/travel/oman/food-2.jpg",
  heroImage: "/images/travel/oman/food-2.jpg",
  categoryId: "dinner",
  category: "Dinner",
  cuisine: "middle-eastern",
  description:
    "Fall-apart lamb shoulder braised low and slow with warm spices, served over rice with herbs and yogurt.",
  quickStats: {
    servings: 6,
    totalTime: "4h 30m",
    difficulty: "Easy",
    ovenTemp: "300°F",
  },
  info: {
    cuisine: "Middle Eastern",
    course: "Dinner",
    method: "Slow Cooked",
    diet: "Halal",
    keywords: ["Lamb", "Braise", "Comfort Food"],
  },
  nutrition: {
    calories: 480,
    protein: "42g",
    carbs: "12g",
    fat: "28g",
  },
  notes:
    "Best made a day ahead. The fat will solidify on top and can be skimmed before reheating.",
  ingredients: [
    {
      label: "Main",
      items: [
        { quantity: "2 kg", quantityMetric: "2 kg", name: "Bone-in Lamb Shoulder" },
        { quantity: "2 tbsp", quantityMetric: "30ml", name: "Ras el Hanout" },
        { quantity: "4 cloves", quantityMetric: "4 cloves", name: "Garlic, smashed" },
        { quantity: "500ml", quantityMetric: "500ml", name: "Chicken Stock" },
      ],
    },
  ],
  steps: [
    {
      number: 1,
      title: "Season & Sear",
      description: "Rub lamb with spice blend. Sear on all sides in a heavy pot until deeply browned.",
      imageSrc: "/images/travel/oman/food-2.jpg",
    },
    {
      number: 2,
      title: "Braise",
      description: "Add garlic and stock. Cover and braise at 300°F for 4 hours until fork-tender.",
      imageSrc: "/images/travel/oman/food-1.jpg",
    },
  ],
  finalResultImages: [
    { src: "/images/travel/oman/food-2.jpg", alt: "Slow cooked lamb shoulder plated" },
  ],
};
