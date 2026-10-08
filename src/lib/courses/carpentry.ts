import type { CourseDefinition } from "./types";

/** George Brown — Carpentry and Home Renovation (continuing education). */
export const CARPENTRY_COURSES: CourseDefinition[] = [
  {
    id: "carp-home-maintenance-basics",
    interest: "carpentry",
    title: "Home Maintenance and Improvements: Basics",
    code: "BLDG 9077",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/home-maintenance-and-improvements-basics",
    blurb:
      "Hands-on home repairs — measuring, cutting, fastening, framing, drywall, doors, and trim.",
    hours: 42,
    sessions: [
      {
        label: "In the shop",
        items: [
          "Preparation & accurate measuring",
          "Cutting & fastening methods",
          "Wall framing",
          "Structural door framing",
          "Non-structural door framing",
          "Window framing",
          "Deck framing",
          "Flooring",
          "Drywall install & repair",
          "Doors and trim",
        ],
      },
    ],
    outcomes: [
      {
        src: "/images/courses/carpentry/framing-wall.png",
        alt: "Practice wall framing in the shop",
        assignment: "Wall framing",
      },
      {
        src: "/images/courses/carpentry/door-structural.png",
        alt: "Structural door opening with king and jack studs",
        assignment: "Structural door framing",
      },
      {
        src: "/images/courses/carpentry/door-framing-board.png",
        alt: "Whiteboard diagrams for structural and non-structural openings",
        assignment: "Non-structural door framing",
      },
      {
        src: "/images/courses/carpentry/window-framing.png",
        alt: "Practice window rough opening with sill and cripple studs",
        assignment: "Window framing",
      },
      {
        src: "/images/courses/carpentry/framing-floor.png",
        alt: "Deck frame with joists laid out in the shop",
        assignment: "Deck framing",
      },
      {
        src: "/images/courses/carpentry/framing-trim.png",
        alt: "Floor plate framing with trim staged inside",
        assignment: "Flooring",
      },
      {
        src: "/images/courses/carpentry/flooring-layout.png",
        alt: "Flooring laid into a practice frame",
        assignment: "Flooring",
      },
      {
        src: "/images/courses/carpentry/drywall-corner.png",
        alt: "Drywall corner with metal corner bead",
        assignment: "Drywall install & repair",
      },
      {
        src: "/images/courses/carpentry/drywall-mud.png",
        alt: "Drywall corner with joint compound applied",
        assignment: "Drywall install & repair",
      },
      {
        src: "/images/courses/carpentry/door-hang.png",
        alt: "Practice door hung in a framed opening",
        assignment: "Doors and trim",
      },
    ],
  },
  {
    id: "carp-basic-woodworking",
    interest: "carpentry",
    title: "Carpentry 1: Basic Woodworking",
    code: "BLDG 9037",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/carpentry-1-basic-woodworking",
    blurb:
      "Hand and power tool fundamentals — mitre box, jewelry box, and wooden toolbox.",
    hours: 42,
    sessions: [
      {
        label: "In the shop",
        items: [
          "Safe hand- and power-tool use",
          "Materials, tools, and procedures",
          "Mitre box",
          "Jewelry box",
          "Wooden toolbox",
        ],
      },
    ],
    outcomes: [
      {
        src: "/images/courses/carpentry/mitre-joints.png",
        alt: "Practice joints and mitre cuts for the mitre box",
        assignment: "Mitre box",
      },
      {
        src: "/images/courses/carpentry/mitre-box-layout.png",
        alt: "Mitre box sides dry-fit into a square",
        assignment: "Mitre box",
      },
      {
        src: "/images/courses/carpentry/jewelry-box.png",
        alt: "Hexagonal jewelry box with hinged lid",
        assignment: "Jewelry box",
      },
      {
        src: "/images/courses/carpentry/toolbox.png",
        alt: "Open wooden toolbox with dowel handle",
        assignment: "Wooden toolbox",
      },
    ],
  },
];
