import type { CourseDefinition } from "./types";

/** George Brown Chef School — continuing education. Session items from public course blurbs. */
export const COOKING_COURSES: CourseDefinition[] = [
  {
    id: "cook-culinary-arts-1",
    interest: "cooking",
    title: "Culinary Arts 1",
    code: "HOSF 9088",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/culinary-arts-1",
    blurb:
      "Knife skills, foundational sauces, and core methods — searing, poaching, roasting, and more.",
    hours: 48,
    sessions: [
      {
        label: "In the kitchen",
        items: [
          "Lasagna",
          "Minestrone",
          "Roast chicken",
          "Steak au poivre",
        ],
      },
    ],
  },
  {
    id: "cook-mediterranean",
    interest: "cooking",
    title: "Mediterranean Cooking",
    code: "HOSF 9080",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/mediterranean-cooking",
    blurb: "France, Spain, Italy, Greece, and North Africa — bright, olive-oil cooking.",
    hours: 24,
    sessions: [
      {
        label: "In the kitchen",
        items: [
          "Baba ghanouj",
          "Tabbouleh",
          "Fish couscous",
          "Pasta paella",
          "Marseilles-style tuna",
          "Panzanella",
          "Stuffed eggplant",
        ],
      },
    ],
  },
  {
    id: "cook-indian-vegetarian",
    interest: "cooking",
    title: "Vegetarian Indian Cooking",
    code: "HOSF 9176",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/vegetarian-indian-cooking",
    blurb: "Spices, dals, and vegetarian plates from the Indian kitchen.",
    hours: 24,
    sessions: [
      {
        label: "In the kitchen",
        items: ["Regional vegetarian dishes", "Spice blends", "Breads & rice"],
      },
    ],
  },
  {
    id: "cook-knife-skills",
    interest: "cooking",
    title: "Knife Skills",
    code: "HOSF 9124",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/knife-skills",
    blurb: "Cuts, care, and confidence — vegetables, fruit, chicken, and fish.",
    hours: 12,
    sessions: [
      {
        label: "Techniques",
        items: [
          "Slicing, dicing, chopping, mincing",
          "Carving",
          "Deboning & filleting",
          "Knife care & safety",
        ],
      },
    ],
  },
  {
    id: "cook-baking-arts-1",
    interest: "cooking",
    title: "Baking Arts",
    code: "HOSF 9134",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/baking-arts",
    blurb: "Pastry foundations — pies, cookies, cakes, tarts, éclairs, and chocolate.",
    hours: 48,
    sessions: [
      {
        label: "In the kitchen",
        items: ["Pies", "Cookies", "Soft rolls", "Cakes", "Tarts", "Éclairs", "Chocolates"],
      },
    ],
  },
  {
    id: "cook-breads",
    interest: "cooking",
    title: "Breads",
    code: "HOSF 9113",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/breads",
    blurb: "Pan and hearth breads — flour, fermentation, and the oven spring.",
    hours: 40,
    sessions: [
      {
        label: "In the kitchen",
        items: ["Challah", "Basic sourdough", "Whole wheat", "Pita", "Focaccia"],
      },
    ],
  },
];
