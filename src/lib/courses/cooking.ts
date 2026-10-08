import type { CourseDefinition } from "./types";

/** George Brown Chef School — continuing education. */
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
        label: "1 · Stocks",
        items: ["Fish stock", "Beef stock", "Chicken stock"],
      },
      {
        label: "2 · Salads",
        items: [
          "Tuscan bean salad",
          "Cucumber onion salad",
          "Pacific Rim beef salad",
        ],
      },
      {
        label: "3 · Soups",
        items: ["Chicken velouté", "Minestrone soup", "Wild mushroom soup"],
      },
      {
        label: "4 · Fish & potatoes",
        items: [
          "Potatoes — duchesse, marquis",
          "Fish velouté",
          "Trout poached in vin blanc with grapes",
        ],
      },
      {
        label: "5 · Pasta",
        items: [
          "Sauce Bolognese",
          "Lasagna al Forno",
          "Tossed salad",
          "Vinaigrette",
          "Garlic bread",
        ],
      },
      {
        label: "6 · Eggs & sauces",
        items: [
          "Basic yellow sauces",
          "Pie pastry",
          "Bacon and mushroom quiche",
          "Hollandaise sauce",
          "Asparagus",
          "French omelette",
        ],
      },
      {
        label: "7 · Braising",
        items: [
          "Vegetable cookery",
          "Carbonnade à la Flammande",
          "Sauce Espagnole",
          "Vegetable macédoine",
        ],
      },
      {
        label: "8 · Roast chicken",
        items: [
          "Roast chicken",
          "Onion and sage dressing",
          "Zucchini provençal",
        ],
      },
      {
        label: "9 · Eastern Europe",
        items: ["Veal goulash", "Beef Stroganoff", "Spätzle"],
      },
      {
        label: "10 · Poached chicken",
        items: [
          "Poached chicken with lemongrass cream",
          "Béchamel sauce",
          "Rice pilaf",
        ],
      },
      {
        label: "11 · Stuffed steak",
        items: [
          "Baked pork steak with apple and Stilton stuffing",
          "Apple sauce",
          "Savoury onion and raisin bread pudding",
        ],
      },
      {
        label: "12 · Roast lamb",
        items: ["Roasted leg of lamb", "Mint sauce", "Cauliflower polonaise"],
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
        label: "1 · Lebanon",
        items: [
          "Khubz Arabee — Pita Bread",
          "Hummus bi-Taheena — Chickpea Purée",
          "Baba Ghannooj — Eggplant Purée",
          "Olives with Za'tar",
          "Tabboola — Parsley and Burghul Salad",
          "Fooliyya — Fava Beans in Oil",
        ],
      },
      {
        label: "2 · Tunisia & Morocco",
        items: [
          "Slata Mechouia Nablia — Pepper Relish",
          "Marka Sfaxia — Fish Couscous from Sfax",
          "Bisteeya — Chicken Pie",
          "Couscous",
        ],
      },
      {
        label: "3 · Spain",
        items: [
          "Gazpacho — Andalusían Cold Tomato Soup",
          "Ensalada Mixta de Jamón Serrano con Queso Manchego",
          "Pasta Paella",
        ],
      },
      {
        label: "4 · France & Italy",
        items: [
          "Thon à la Marseillaise — Tuna Marseilles Style",
          "Insalata Panzanella",
          "Involtini",
        ],
      },
      {
        label: "5 · Greece",
        items: [
          "Avgolemono Soupa — Soup with Lemon and Egg",
          "Horiatiki Salata — Greek Salad",
          "Garithes Youvetsi — Shrimp in Sauce with Feta",
        ],
      },
      {
        label: "6 · Turkey",
        items: [
          "Iman Bayildi — Cold Stuffed Eggplant",
          "Istanbul Pilavi — Istanbul Style Pilaf",
          "Baklava — Honey Nut Cakes",
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
        label: "1 · Spices & snacks",
        items: [
          "Introduction to Indian spices",
          "Onion bhajia",
          "Vegetable pakoras",
          "Paneer makhni",
          "Missi roti",
        ],
      },
      {
        label: "2 · Aloo gobi",
        items: ["Aloo gobi", "Vegetable pulao", "Dal panchratan"],
      },
      {
        label: "3 · Kashmiri",
        items: ["Kashmiri pulao", "Baigan bhartha", "Gajjar halwa"],
      },
      {
        label: "4 · Saag & channa",
        items: ["Saag paneer", "Channa bhaturas", "Shahi tukrha"],
      },
      {
        label: "5 · Tandoori",
        items: [
          "Tandoori gobi",
          "Vegetable and paneer kebabs",
          "Garlic naan",
          "Tandoori roti",
          "Mint chutney",
        ],
      },
      {
        label: "6 · Biryani",
        items: ["Vegetable biryani", "Dal makhni", "Kachumber raita"],
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
        label: "1 · Fundamentals",
        items: [
          "Knife care & safety",
          "Grip, stance, and sharpening",
          "Slicing, dicing, chopping, mincing",
        ],
      },
      {
        label: "2 · Classic cuts",
        items: [
          "Julienne, allumette, batonnet, brunoise",
          "Paysanne, chiffonade, tourné",
          "Vegetable & fruit practice",
        ],
      },
      {
        label: "3 · Protein butchery",
        items: ["Carving", "Deboning chicken", "Filleting fish"],
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
        label: "1 · Pie dough",
        items: ["Pie dough make-up", "Rolling exercise"],
      },
      {
        label: "2 · Apple pie",
        items: ["Fresh apple pie"],
      },
      {
        label: "3 · Muffins & biscuits",
        items: ["Bran muffins", "Tea biscuits"],
      },
      {
        label: "4 · Custards",
        items: [
          "Custards",
          "Crème caramel",
          "Panna cotta",
          "Bread and butter pudding",
        ],
      },
      {
        label: "5 · Soft rolls",
        items: ["Soft rolls"],
      },
      {
        label: "6 · Piping & meringue",
        items: [
          "Piping — stars and plain",
          "Masking skills",
          "Meringue kiss cookies",
          "Crème anglaise",
        ],
      },
      {
        label: "7 · Cookies",
        items: ["Piped cookies", "Peanut butter cookies"],
      },
      {
        label: "8 · Choux",
        items: ["Choux paste", "Crème puffs", "Éclairs"],
      },
      {
        label: "9 · Black Forest",
        items: ["Black Forest cake"],
      },
      {
        label: "10 · Chocolate cake",
        items: [
          "Chocolate Swiss roll",
          "Chocolate sponge",
          "Chocolate buttercream",
          "Chocolate glaze",
        ],
      },
      {
        label: "11 · Tarts",
        items: ["Fresh fruit flan / tarts"],
      },
      {
        label: "12 · Tempering",
        items: ["Chocolate tempering"],
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
        label: "1 · Foundations",
        items: [
          "Moulding dough & exercises",
          "Buns",
          "Free-form loaves",
          "Yeast conversion",
        ],
      },
      {
        label: "2 · Baguette",
        items: ["Baguette"],
      },
      {
        label: "3 · Vienna & burenbrot",
        items: ["Vienna bread", "Burenbrot"],
      },
      {
        label: "4 · Whole grain",
        items: ["Sourdough starter", "Whole wheat bread", "Six grain bread"],
      },
      {
        label: "5 · Enriched",
        items: ["Brioche", "Challah"],
      },
      {
        label: "6 · Sourdough",
        items: ["Basic sourdough"],
      },
      {
        label: "7 · Cheese buns & fougasse",
        items: ["Cheese buns", "Fougasse"],
      },
      {
        label: "8 · Pizza",
        items: ["Pizza"],
      },
      {
        label: "9 · Hot cross & paskas",
        items: ["Hot cross buns", "Paskas"],
      },
      {
        label: "10 · Flatbreads",
        items: ["Pita", "Focaccia"],
      },
    ],
  },
  {
    id: "cook-dosa-masterclass",
    interest: "cooking",
    title: "Dosa Masterclass",
    school: "Arth Toronto",
    href: "https://www.instagram.com/arth.toronto/",
    blurb:
      "South Indian dosa from batter to plate — sambar, aloo masala, and two chutneys.",
    hours: 3,
    sessions: [
      {
        label: "Menu",
        items: [
          "Dosa batter",
          "Sambar",
          "Aloo masala",
          "Tomato-onion chutney",
          "Coconut chutney",
        ],
      },
    ],
  },
];
