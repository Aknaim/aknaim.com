import type { SiteData } from "../types";

export const siteData: SiteData = {
  personal: {
    name: "Akbar Naim",
    siteTitle: "Akbar Naim",
    headlinePrefix: "",
    headlineEmphasis: "Projects & Pursuits",  // The stylish serif focus
    headlineSuffix: "",
    bio: "An open archive of things built, climbed, cooked, and coded. Just a central log of active experiments.",
    bagPeekHint: "Hover over a bag to peek inside.",
    aboutCta: {
      label: "About Me",
      href: "/about",
    },
    location: "Toronto, Canada",
    email: "aknaim@outlook.com",
    social: [
      {
        platform: "github",
        label: "GitHub",
        url: "https://github.com/akN",
        icon: "Github",
      },
      {
        platform: "linkedin",
        label: "LinkedIn",
        url: "https://linkedin.com/in/akN",
        icon: "Linkedin",
      },
      {
        platform: "email",
        label: "Email",
        url: "mailto:hello@akN.com",
        icon: "Mail",
      },
    ],
  },

  navigation: [
    {
      id: "journal",
      label: "Journal",
      href: "/journal",
      external: false,
    },
    {
      id: "about",
      label: "About",
      href: "/about",
      external: false,
    },
  ],

  interests: [
    {
      id: "engineering",
      label: "Engineering",
      icon: "Cpu",
      status: "active",
      bagImage: "/images/hero/bag-engineering.jpg",
      peekImage: "/images/hero/peek-engineering.jpg",
      peekCaption: "Mechanical keyboard, observability diagrams, and dense system specs.",
      workbenchNote: "Currently optimizing high-throughput distributed systems & infrastructure scaling.",
      panelAnchor: "engineering",
      tagline: "Systems, code, and solving problems at scale.",
      heroImage: "/images/hero/hero-engineering.jpg",
      tabs: [
        {
          id: "projects",
          label: "Projects",
          items: [
            { id: "e1", title: "ML Inference Pipeline", meta: "Apr 30, 2026", linkUrl: "/projects/inference" },
            { id: "e2", title: "Event Processing System", meta: "Mar 22, 2026" },
            { id: "e3", title: "API Rate Limiter", meta: "Feb 8, 2026" }
          ]
        },
        {
          id: "notes",
          label: "Notes",
          items: [
            { id: "en1", title: "Distributed Consensus Mechanics", meta: "Core Engineering Architecture" },
            { id: "en2", title: "Linux Kernel Memory Tuning", meta: "Performance Optimization" }
          ]
        },
        {
          id: "systems",
          label: "Systems",
          items: [
            { id: "es1", title: "Kubernetes Core Cluster", meta: "Bare metal setup" },
            { id: "es2", title: "Grafana Stack", meta: "Distributed Metrics Pipeline" }
          ]
        }
      ]
    },
    {
      id: "climbing",
      label: "Climbing",
      icon: "Mountain",
      status: "active",
      bagImage: "/images/hero/bag-climbing.jpg",
      peekImage: "/images/hero/peek-climbing.jpg",
      peekCaption: "Aggressive downturned shoes, harness, Edelrid Ohmega, and chalk bag.",
      workbenchNote: "Projecting indoor 5.12+ top-rope grades and refining lead safety techniques.",
      panelAnchor: "climbing",
      tagline: "Progress, lessons, and mountain days.",
      heroImage: "/images/hero/hero-climbing.jpg",
      tabs: [
        {
          id: "logbook",
          label: "Logbook",
          items: [
            { id: "c1", title: "Red River Gorge Trip", meta: "May 18, 2026", thumbnail: "/images/thumbs/rrg.jpg", linkUrl: "/journal/rrg" },
            { id: "c2", title: "First 5.12 Lead", meta: "Apr 22, 2026", thumbnail: "/images/thumbs/lead.jpg" },
            { id: "c3", title: "Training & Consistency", meta: "Mar 10, 2026", thumbnail: "/images/thumbs/training.jpg" }
          ]
        },
        {
          id: "routes",
          label: "Routes",
          items: [
            { id: "cr1", title: "Airfield (5.12a)", meta: "Red River Gorge • Sent" },
            { id: "cr2", title: "Amarillo Sunset (5.11b)", meta: "Red River Gorge • Flash" }
          ]
        },
        {
          id: "gear",
          label: "Gear",
          items: [
            { id: "cg1", title: "La Sportiva Solution Comp", meta: "Primary Bouldering Shoe" },
            { id: "cg2", title: "Petzl Grigri + Caritool", meta: "Belay Mechanics Assembly" }
          ]
        },
        {
          id: "lessons",
          label: "Lessons",
          items: [
            { id: "cl1", title: "Dynamic Fall Braking", meta: "Lead Belaying Nuances" },
            { id: "cl2", title: "Rest Positioning Tactics", meta: "Endurance Management" }
          ]
        }
      ]
    },
    {
      id: "cooking",
      label: "Cooking",
      icon: "ChefHat",
      status: "active",
      bagImage: "/images/hero/bag-cooking.jpg",
      peekImage: "/images/hero/peek-cooking.jpg",
      peekCaption: "Infrared thermometer, cast-iron pans, and outdoor pizza deck tooling.",
      workbenchNote: "Perfecting high-heat outdoor roasting, custom dough hydration levels, and curry styles.",
      panelAnchor: "cooking",
      tagline: "Recipes, techniques, and delicious experiments.",
      heroImage: "/images/hero/hero-cooking.jpg",
      tabs: [
        {
          id: "recipes",
          label: "Recipes",
          items: [
            { id: "ck1", title: "Sourdough Pizza", meta: "May 5, 2026", thumbnail: "/images/thumbs/pizza.jpg" },
            { id: "ck2", title: "Handmade Pasta", meta: "Apr 27, 2026", thumbnail: "/images/thumbs/pasta.jpg" },
            { id: "ck3", title: "Fermented Hot Sauce", meta: "Apr 12, 2026", thumbnail: "/images/thumbs/sauce.jpg" }
          ]
        },
        {
          id: "journal",
          label: "Journal",
          items: [
            { id: "cj1", title: "Sourdough Starter Hydration Logs", meta: "Adjusting ambient fermentation variables" },
            { id: "cj2", title: "Neapolitan vs New York Profile", meta: "Baking floor temperature benchmarks" }
          ]
        },
        {
          id: "gear",
          label: "Gear",
          items: [
            { id: "ckg1", title: "Gozney Roccbox", meta: "High-Heat Outdoor Propane Oven" },
            { id: "ckg2", title: "Lodge 12-Inch Cast Iron Skillet", meta: "Heat Retention Baseline" }
          ]
        }
      ]
    },
    {
      id: "photography",
      label: "Photography",
      icon: "Camera",
      status: "dormant",
      bagImage: "/images/hero/bag-photography.jpg",
      peekImage: "/images/hero/peek-photography.jpg",
      peekCaption: "Sony full-frame body, manual prime lenses, and landscape filters.",
      stowedDate: "Active season: Fall 2024",
      panelAnchor: "photography",
      tagline: "Capturing moments and chasing light.",
      heroImage: "/images/hero/hero-photography.jpg",
      tabs: [
        {
          id: "galleries",
          label: "Galleries",
          items: [
            { id: "ph1", title: "Pacific Northwest Mist", meta: "12 Photos", thumbnail: "/images/thumbs/pnw.jpg" },
            { id: "ph2", title: "Tokyo Neon Nights", meta: "8 Photos", thumbnail: "/images/thumbs/tokyo.jpg" }
          ]
        },
        {
          id: "gear",
          label: "Gear",
          items: [
            { id: "phg1", title: "Sony Alpha 7 IV", meta: "Full-Frame Mirrorless Body" },
            { id: "phg2", title: "35mm f/1.4 GM Lens", meta: "Primary Prime Unit" }
          ]
        },
        {
          id: "stories",
          label: "Stories",
          items: [
            { id: "phs1", title: "Chasing Golden Hour at 5 AM", meta: "Field Journal" }
          ]
        }
      ]
    },
    {
      id: "travel",
      label: "Travel",
      icon: "Plane",
      status: "active",
      bagImage: "/images/hero/bag-travel.jpg",
      peekImage: "/images/hero/peek-travel.jpg",
      peekCaption: "Passports, field notes, and topographic maps.",
      stowedDate: "Last expedition: Summer 2024",
      panelAnchor: "travel",
      tagline: "Stories from places that shape perspective.",
      heroImage: "/images/hero/hero-travel.jpg",
      tabs: [
        {
          id: "stories",
          label: "Stories",
          items: [
            { id: "t1", title: "Amalfi Coast, Italy", meta: "Aug 5, 2025", thumbnail: "/images/thumbs/italy.jpg" },
            { id: "t2", title: "Patagonia Road Trip", meta: "Feb 10, 2025", thumbnail: "/images/thumbs/patagonia.jpg" },
            { id: "t3", title: "Japan in 3 Weeks", meta: "Apr 7, 2024", thumbnail: "/images/thumbs/japan.jpg" }
          ]
        },
        {
          id: "itineraries",
          label: "Itineraries",
          items: [
            { id: "ti1", title: "Kyoto Backstreets Route", meta: "Historical Architecture Focus" },
            { id: "ti2", title: "Torres del Paine W-Trek", meta: "Self-Supported Hiking Logistics" }
          ]
        },
        {
          id: "maps",
          label: "Maps",
          items: [
            { id: "tm1", title: "Custom Tokyo Coffee Log", meta: "Sparsed Google Maps Overlay" }
          ]
        }
      ]
    },
    {
      id: "woodworking",
      label: "Woodworking",
      icon: "Hammer",
      status: "dormant",
      bagImage: "/images/hero/bag-woodworking.jpg",
      peekImage: "/images/hero/peek-woodworking.jpg",
      peekCaption: "Japanese hand saws, marking gauges, and walnut timber offcuts.",
      stowedDate: "Stowed away since: Winter 2023",
      panelAnchor: "woodworking",
      tagline: "Building things that last.",
      heroImage: "/images/hero/hero-woodworking.jpg",
      tabs: [
        {
          id: "projects",
          label: "Projects",
          items: [
            { id: "w1", title: "Walnut Coffee Table", meta: "Apr 20, 2025", thumbnail: "/images/thumbs/table.jpg" },
            { id: "w2", title: "Tool Chest", meta: "Mar 15, 2024", thumbnail: "/images/thumbs/chest.jpg" },
            { id: "w3", title: "Shelving Unit", meta: "Feb 2, 2024", thumbnail: "/images/thumbs/shelves.jpg" }
          ]
        },
        {
          id: "journal",
          label: "Journal",
          items: [
            { id: "wj1", title: "Mortise & Tenon Joint Tuning", meta: "Refining hand-chisel techniques" },
            { id: "wj2", title: "Oil vs Wax Wood Finishes", meta: "Long-term walnut durability test" }
          ]
        },
        {
          id: "plans",
          label: "Plans",
          items: [
            { id: "wp1", title: "Minimalist Work Desk Blueprint", meta: "CAD Vector Formats Included" }
          ]
        }
      ]
    }
  ],

  skills: [
    {
      id: "skill-typescript",
      name: "TypeScript",
      category: "language",
      proficiency: "expert",
      icon: "FileCode",
      relatedProjectIds: ["eng-portfolio", "eng-api-gateway"],
    },
    {
      id: "skill-python",
      name: "Python",
      category: "language",
      proficiency: "comfortable",
      icon: "FileCode",
      relatedProjectIds: ["eng-data-pipeline"],
    },
    {
      id: "skill-react",
      name: "React",
      category: "framework",
      proficiency: "expert",
      icon: "Layers",
      relatedProjectIds: ["eng-portfolio"],
    },
    {
      id: "skill-nextjs",
      name: "Next.js",
      category: "framework",
      proficiency: "expert",
      icon: "Layers",
      relatedProjectIds: ["eng-portfolio"],
    },
    {
      id: "skill-node",
      name: "Node.js",
      category: "platform",
      proficiency: "comfortable",
      icon: "Server",
      relatedProjectIds: ["eng-api-gateway"],
    },
    {
      id: "skill-postgres",
      name: "PostgreSQL",
      category: "tool",
      proficiency: "comfortable",
      icon: "Database",
      relatedProjectIds: ["eng-data-pipeline"],
    },
    {
      id: "skill-docker",
      name: "Docker",
      category: "tool",
      proficiency: "comfortable",
      icon: "Box",
      relatedProjectIds: ["eng-api-gateway"],
    },
    {
      id: "skill-aws",
      name: "AWS",
      category: "cloud",
      proficiency: "comfortable",
      icon: "Cloud",
      relatedProjectIds: ["eng-data-pipeline", "eng-api-gateway"],
    },
    {
      id: "skill-terraform",
      name: "Terraform",
      category: "cloud",
      proficiency: "learning",
      icon: "CloudCog",
      relatedProjectIds: ["eng-infra-automation"],
    },
    {
      id: "skill-system-design",
      name: "System Design",
      category: "soft",
      proficiency: "expert",
      icon: "Network",
      relatedProjectIds: [
        "eng-api-gateway",
        "eng-data-pipeline",
        "eng-infra-automation",
      ],
    },
  ],

  projects: [
    {
      id: "photo-landscape-01",
      category: "photography",
      tag: "landscapes",
      title: "Dawn over the ridge",
      date: "2024-05-12",
      description: "Golden-hour landscape from a weekend hike.",
      image: "/images/photography/landscape-01.jpg",
      href: "/photography/dawn-over-the-ridge",
      location: "Colorado, USA",
      alt: "Mountain ridge at sunrise with low clouds",
    },
    {
      id: "photo-urban-01",
      category: "photography",
      tag: "urban",
      title: "Alley geometry",
      date: "2024-03-08",
      description: "Urban lines and shadow play between buildings.",
      image: "/images/photography/urban-01.jpg",
      href: "/photography/alley-geometry",
      location: "Chicago, USA",
      alt: "Narrow urban alley with strong perspective lines",
    },
    {
      id: "photo-wildlife-01",
      category: "photography",
      tag: "wildlife",
      title: "Heron at the marsh",
      date: "2024-01-22",
      description: "Long lens capture at wetland preserve.",
      image: "/images/photography/wildlife-01.jpg",
      href: "/photography/heron-at-the-marsh",
      location: "Wisconsin, USA",
      alt: "Great blue heron standing in shallow marsh water",
    },
    {
      id: "climb-log-01",
      category: "climbing",
      tag: "logbook",
      title: "The Nose — partial ascent",
      date: "2024-04-18",
      description: "Multi-pitch trad day on iconic granite.",
      image: "/images/bento/climb-thumb.jpg",
      href: "/climbing/the-nose-partial",
      grade: "5.9 C2",
      location: "Yosemite, CA",
      routeName: "The Nose",
      highlight: false,
    },
    {
      id: "climb-log-02",
      category: "climbing",
      tag: "logbook",
      title: "Midnight Lightning",
      date: "2024-02-03",
      description: "Classic boulder problem in Camp 4.",
      image: "/images/bento/climb-thumb.jpg",
      href: "/climbing/midnight-lightning",
      grade: "V8",
      location: "Yosemite, CA",
      routeName: "Midnight Lightning",
      highlight: false,
    },
    {
      id: "climb-log-03",
      category: "climbing",
      tag: "logbook",
      title: "Epicenter",
      date: "2023-11-15",
      description: "Overhanging sport route with technical crux.",
      image: "/images/bento/climb-thumb.jpg",
      href: "/climbing/epicenter",
      grade: "5.12a",
      location: "Smith Rock, OR",
      routeName: "Epicenter",
      highlight: false,
    },
    {
      id: "climb-log-04",
      category: "climbing",
      tag: "logbook",
      title: "Outer Limits",
      date: "2023-09-02",
      description: "Steep pocket climbing on quality stone.",
      image: "/images/bento/climb-thumb.jpg",
      href: "/climbing/outer-limits",
      grade: "5.11d",
      location: "Red River Gorge, KY",
      routeName: "Outer Limits",
      highlight: false,
    },
    {
      id: "climb-highlight-01",
      category: "climbing",
      tag: "logbook",
      title: "Session Highlight — Pitch 3",
      date: "2024-04-18",
      description: "Clean send on the crux pitch before rain moved in.",
      image: "/images/bento/climb-thumb.jpg",
      href: "/climbing/session-highlight-pitch-3",
      grade: "5.10c",
      location: "Yosemite, CA",
      routeName: "The Nose — Pitch 3",
      highlight: true,
    },
    {
      id: "cook-sourdough",
      category: "cooking",
      tag: "savoury",
      title: "Sourdough boule",
      date: "2024-12-22",
      description: "75% hydration, overnight cold proof, cast-iron bake.",
      image: "/images/hero/peek-cooking.jpg",
      href: "/cooking/sourdough-boule",
      thumbnail: "/images/hero/peek-cooking.jpg",
      recipeType: "Bread",
    },
    {
      id: "cook-lamb",
      category: "cooking",
      tag: "savoury",
      title: "Slow Cooked Lamb Shoulder",
      date: "2025-04-27",
      description: "Slow-braised with warm spices, served over rice with herbs and yogurt.",
      image: "/images/travel/oman/food-2.jpg",
      href: "/cooking/lamb-shoulder",
      thumbnail: "/images/travel/oman/food-2.jpg",
      recipeType: "Main",
    },
    {
      id: "cook-matcha",
      category: "cooking",
      tag: "sweet",
      title: "Matcha tiramisu",
      date: "2024-09-18",
      description: "Layered mascarpone cream with ceremonial-grade matcha.",
      image: "/images/travel/oman/food-3.jpg",
      href: "/cooking/matcha-tiramisu",
      thumbnail: "/images/travel/oman/food-3.jpg",
      recipeType: "Dessert",
    },
    {
      id: "travel-story-01",
      category: "travel",
      tag: "europe",
      title: "Amalfi coast by ferry",
      date: "2024-06-10",
      description: "Coastal towns, lemon groves, and late dinners in Positano.",
      image: "/images/travel/story-01.jpg",
      href: "/travel/amalfi-coast",
      thumbnail: "/images/travel/story-01.jpg",
      region: "Campania",
      country: "Italy",
    },
    {
      id: "travel-story-02",
      category: "travel",
      tag: "europe",
      title: "Kyoto temple walk",
      date: "2023-10-18",
      description: "Autumn maples and early-morning meditation paths.",
      image: "/images/travel/story-02.jpg",
      href: "/travel/kyoto-temple-walk",
      thumbnail: "/images/travel/story-02.jpg",
      region: "Kansai",
      country: "Japan",
    },
    {
      id: "travel-story-03",
      category: "travel",
      tag: "asia",
      title: "Hanoi street food circuit",
      date: "2023-07-04",
      description: "Pho, bún chả, and coffee on plastic stools.",
      image: "/images/travel/story-03.jpg",
      href: "/travel/hanoi-street-food",
      thumbnail: "/images/travel/story-03.jpg",
      region: "Red River Delta",
      country: "Vietnam",
    },
    {
      id: "travel-story-04",
      category: "travel",
      tag: "europe",
      title: "Iceland ring road — segment 3",
      date: "2022-08-22",
      description: "Waterfalls, black sand, and midnight sun drives.",
      image: "/images/travel/story-04.jpg",
      href: "/travel/iceland-ring-road",
      thumbnail: "/images/travel/story-04.jpg",
      region: "South Coast",
      country: "Iceland",
    },
    {
      id: "travel-map-italy",
      category: "travel",
      tag: "europe",
      title: "Italy — travel map",
      date: "2024-06-10",
      description: "Static map visual highlighting coastal route.",
      image: "/images/travel/italy-map.jpg",
      href: "/travel/italy-map",
      thumbnail: "/images/travel/italy-map.jpg",
      region: "Italy",
      country: "Italy",
    },
    {
      id: "wood-project-01",
      category: "woodworking",
      tag: "projects",
      title: "Walnut dining table",
      date: "2024-01-10",
      description: "Breadboard ends, hand-cut joinery, oil finish.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/walnut-dining-table",
      featured: true,
      material: "American walnut",
    },
    {
      id: "wood-project-02",
      category: "woodworking",
      tag: "projects",
      title: "Maple wall shelf",
      date: "2023-09-14",
      description: "Floating shelf with concealed brass pins.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/maple-wall-shelf",
      featured: false,
      material: "Hard maple",
    },
    {
      id: "wood-project-03",
      category: "woodworking",
      tag: "projects",
      title: "Cherry keepsake box",
      date: "2023-05-02",
      description: "Dovetail corners and suede-lined interior.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/cherry-keepsake-box",
      featured: false,
      material: "Cherry",
    },
    {
      id: "wood-project-04",
      category: "woodworking",
      tag: "projects",
      title: "Ash workbench top",
      date: "2022-11-28",
      description: "Laminated top with dog holes and vise retrofit.",
      image: "/images/woodworking/featured-project.jpg",
      href: "/woodworking/ash-workbench-top",
      featured: false,
      material: "Ash",
    },
    {
      id: "eng-portfolio",
      category: "engineering",
      tag: "projects",
      title: "akN.com",
      date: "2026-05-22",
      description:
        "Personal portfolio built with Next.js App Router and Tailwind v4.",
      image: "/images/engineering/system-diagram.jpg",
      href: "https://github.com/akN/akN.com",
      stack: ["Next.js", "TypeScript", "Tailwind CSS"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: true,
      repositoryUrl: "https://github.com/akN/akN.com",
    },
    {
      id: "eng-api-gateway",
      category: "engineering",
      tag: "system-design",
      title: "API gateway service",
      date: "2024-08-01",
      description:
        "Rate-limited edge gateway with JWT validation and observability.",
      image: "/images/engineering/system-diagram.jpg",
      href: "/engineering/api-gateway",
      stack: ["Node.js", "Redis", "Docker", "AWS"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: false,
      repositoryUrl: "https://github.com/akN/api-gateway",
    },
    {
      id: "eng-data-pipeline",
      category: "engineering",
      tag: "system-design",
      title: "Event ingestion pipeline",
      date: "2024-02-15",
      description:
        "Batch and stream processing with idempotent writes to warehouse.",
      image: "/images/engineering/system-diagram.jpg",
      href: "/engineering/data-pipeline",
      stack: ["Python", "PostgreSQL", "S3", "Lambda"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: false,
      repositoryUrl: "https://github.com/akN/data-pipeline",
    },
    {
      id: "eng-infra-automation",
      category: "engineering",
      tag: "docs",
      title: "Infrastructure automation",
      date: "2023-12-01",
      description:
        "Terraform modules for reproducible staging and production environments.",
      image: "/images/engineering/system-diagram.jpg",
      href: "/engineering/infra-automation",
      stack: ["Terraform", "AWS", "GitHub Actions"],
      diagramImage: "/images/engineering/system-diagram.jpg",
      featured: false,
      repositoryUrl: "https://github.com/akN/infra-automation",
    },
  ],

  sectionTabs: {
    photography: [
      { id: "all", label: "ALL" },
      { id: "landscapes", label: "LANDSCAPES" },
      { id: "urban", label: "URBAN" },
      { id: "wildlife", label: "WILDLIFE" },
    ],
    climbing: [
      { id: "logbook", label: "LOGBOOK" },
      { id: "routes", label: "ROUTES" },
      { id: "lessons", label: "LESSONS" },
      { id: "gear", label: "GEAR" },
    ],
    cooking: [
      { id: "all", label: "ALL" },
      { id: "savoury", label: "SAVOURY" },
      { id: "sweet", label: "SWEET" },
    ],
    travel: [
      { id: "all", label: "ALL" },
      { id: "europe", label: "EUROPE" },
      { id: "asia", label: "ASIA" },
    ],
    woodworking: [
      { id: "projects", label: "PROJECTS" },
      { id: "tools", label: "TOOLS" },
      { id: "lessons", label: "LESSONS" },
    ],
    engineering: [
      { id: "projects", label: "PROJECTS" },
      { id: "system-design", label: "SYSTEM DESIGN" },
      { id: "docs", label: "DOCS" },
    ],
  },
};
