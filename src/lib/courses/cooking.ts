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
        label: "Stocks",
        items: ["Fish stock", "Beef stock", "Chicken stock"],
      },
      {
        label: "Salads",
        items: [
          "Tuscan bean salad",
          "Cucumber onion salad",
          "Pacific Rim beef salad",
        ],
      },
      {
        label: "Soups",
        items: ["Chicken velouté", "Minestrone soup", "Wild mushroom soup"],
      },
      {
        label: "Fish & potatoes",
        items: [
          "Potatoes — duchesse, marquis",
          "Fish velouté",
          "Trout poached in vin blanc with grapes",
        ],
      },
      {
        label: "Pasta",
        items: [
          "Sauce Bolognese",
          "Lasagna al Forno",
          "Tossed salad",
          "Vinaigrette",
          "Garlic bread",
        ],
      },
      {
        label: "Eggs & sauces",
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
        label: "Braising",
        items: [
          "Vegetable cookery",
          "Carbonnade à la Flammande",
          "Sauce Espagnole",
          "Vegetable macédoine",
        ],
      },
      {
        label: "Roast chicken",
        items: [
          "Roast chicken",
          "Onion and sage dressing",
          "Zucchini provençal",
        ],
      },
      {
        label: "Eastern Europe",
        items: ["Veal goulash", "Beef Stroganoff", "Spätzle"],
      },
      {
        label: "Poached chicken",
        items: [
          "Poached chicken with lemongrass cream",
          "Béchamel sauce",
          "Rice pilaf",
        ],
      },
      {
        label: "Stuffed steak",
        items: [
          "Baked pork steak with apple and Stilton stuffing",
          "Apple sauce",
          "Savoury onion and raisin bread pudding",
        ],
      },
      {
        label: "Roast lamb",
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
        label: "Lebanon",
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
        label: "Tunisia & Morocco",
        items: [
          "Slata Mechouia Nablia — Pepper Relish",
          "Marka Sfaxia — Fish Couscous from Sfax",
          "Bisteeya — Chicken Pie",
          "Couscous",
        ],
      },
      {
        label: "Spain",
        items: [
          "Gazpacho — Andalusían Cold Tomato Soup",
          "Ensalada Mixta de Jamón Serrano con Queso Manchego",
          "Pasta Paella",
        ],
      },
      {
        label: "France & Italy",
        items: [
          "Thon à la Marseillaise — Tuna Marseilles Style",
          "Insalata Panzanella",
          "Involtini",
        ],
      },
      {
        label: "Greece",
        items: [
          "Avgolemono Soupa — Soup with Lemon and Egg",
          "Horiatiki Salata — Greek Salad",
          "Garithes Youvetsi — Shrimp in Sauce with Feta",
        ],
      },
      {
        label: "Turkey",
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
        label: "Spices & snacks",
        items: [
          "Introduction to Indian spices",
          "Onion bhajia",
          "Vegetable pakoras",
          "Paneer makhni",
          "Missi roti",
        ],
      },
      {
        label: "Aloo gobi",
        items: ["Aloo gobi", "Vegetable pulao", "Dal panchratan"],
      },
      {
        label: "Kashmiri",
        items: ["Kashmiri pulao", "Baigan bhartha", "Gajjar halwa"],
      },
      {
        label: "Saag & channa",
        items: ["Saag paneer", "Channa bhaturas", "Shahi tukrha"],
      },
      {
        label: "Tandoori",
        items: [
          "Tandoori gobi",
          "Vegetable and paneer kebabs",
          "Garlic naan",
          "Tandoori roti",
          "Mint chutney",
        ],
      },
      {
        label: "Biryani",
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
        label: "Fundamentals",
        items: [
          "Knife care & safety",
          "Grip, stance, and sharpening",
          "Slicing, dicing, chopping, mincing",
        ],
      },
      {
        label: "Classic cuts",
        items: [
          "Julienne, allumette, batonnet, brunoise",
          "Paysanne, chiffonade, tourné",
          "Vegetable & fruit practice",
        ],
      },
      {
        label: "Protein butchery",
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
        label: "Pie dough",
        items: ["Pie dough make-up", "Rolling exercise"],
      },
      {
        label: "Apple pie",
        items: ["Fresh apple pie"],
      },
      {
        label: "Muffins & biscuits",
        items: ["Bran muffins", "Tea biscuits"],
      },
      {
        label: "Custards",
        items: [
          "Custards",
          "Crème caramel",
          "Panna cotta",
          "Bread and butter pudding",
        ],
      },
      {
        label: "Soft rolls",
        items: ["Soft rolls"],
      },
      {
        label: "Piping & meringue",
        items: [
          "Piping — stars and plain",
          "Masking skills",
          "Meringue kiss cookies",
          "Crème anglaise",
        ],
      },
      {
        label: "Cookies",
        items: ["Piped cookies", "Peanut butter cookies"],
      },
      {
        label: "Choux",
        items: ["Choux paste", "Crème puffs", "Éclairs"],
      },
      {
        label: "Black Forest",
        items: ["Black Forest cake"],
      },
      {
        label: "Chocolate cake",
        items: [
          "Chocolate Swiss roll",
          "Chocolate sponge",
          "Chocolate buttercream",
          "Chocolate glaze",
        ],
      },
      {
        label: "Tarts",
        items: ["Fresh fruit flan / tarts"],
      },
      {
        label: "Tempering",
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
        label: "Foundations",
        items: [
          "Moulding dough & exercises",
          "Buns",
          "Free-form loaves",
          "Yeast conversion",
        ],
      },
      {
        label: "Baguette",
        items: ["Baguette"],
      },
      {
        label: "Vienna & burenbrot",
        items: ["Vienna bread", "Burenbrot"],
      },
      {
        label: "Whole grain",
        items: ["Sourdough starter", "Whole wheat bread", "Six grain bread"],
      },
      {
        label: "Enriched",
        items: ["Brioche", "Challah"],
      },
      {
        label: "Sourdough",
        items: ["Basic sourdough"],
      },
      {
        label: "Cheese buns & fougasse",
        items: ["Cheese buns", "Fougasse"],
      },
      {
        label: "Pizza",
        items: ["Pizza"],
      },
      {
        label: "Hot cross & paskas",
        items: ["Hot cross buns", "Paskas"],
      },
      {
        label: "Flatbreads",
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
