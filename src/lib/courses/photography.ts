import type { CourseDefinition } from "./types";

export const PHOTOGRAPHY_COURSES: CourseDefinition[] = [
  {
    id: "photo-digital-1",
    interest: "photography",
    title: "Digital Photography 1: Fundamentals",
    code: "PHOT 9037",
    school: "George Brown · Continuing Education",
    href: "https://coned.georgebrown.ca/courses-and-programs/digital-photography-1-fundamentals",
    blurb:
      "Manual exposure, RAW workflow, and critiquing your own frames — camera control before the edit.",
    hours: 21,
    sessions: [
      { label: "Assignment 1", items: ["ISO & White Balance"] },
      { label: "Assignment 2", items: ["Shutter Speeds"] },
      { label: "Assignment 3", items: ["Aperture & Manual Exposure"] },
      { label: "Assignment 4", items: ["Composition & Rule of Thirds"] },
      { label: "Assignment 5", items: ["Variations on a Theme"] },
      { label: "Assignment 6", items: ["Portraiture"] },
    ],
  },
];
