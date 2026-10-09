export interface Destination {
    id: string;
    number: string;
    title: string;
    subtitle?: string;
    photosCount: number;
    notesCount: number;
    date: string;
    imageSrc: string;
    // Percentage coordinates to place pins precisely over your custom world map background image
    mapCoordinates: { x: number; y: number };
    /** True when a trips row exists for this destination (detail page is available). */
    hasDetail?: boolean;
  }
  
  export const travelStats = {
    places: 9,
    photos: "25k+",
    notes: "120+",
    memories: "∞",
  };
  
  export const destinations: Destination[] = [
    {
      id: "canada",
      number: "01",
      title: "Canada",
      photosCount: 48,
      notesCount: 12,
      date: "2016-06-01",
      imageSrc: "/images/travel/canada.jpg",
      // Toronto
      mapCoordinates: { x: 22.5, y: 31.0 },
    },
    {
      id: "usa",
      number: "02",
      title: "United States",
      photosCount: 156,
      notesCount: 18,
      date: "2012-06-01",
      imageSrc: "/images/travel/usa.jpg",
      // New York
      mapCoordinates: { x: 24.5, y: 33.0 },
    },
    {
      id: "russia",
      number: "03",
      title: "Russia",
      photosCount: 72,
      notesCount: 9,
      date: "Jan 2023",
      imageSrc: "/images/travel/russia.jpg",
      // Moscow
      mapCoordinates: { x: 56.5, y: 25.0 },
    },
    {
      id: "germany",
      number: "04",
      title: "Germany",
      photosCount: 64,
      notesCount: 11,
      date: "2008-06-01",
      imageSrc: "/images/travel/germany.jpg",
      // Berlin
      mapCoordinates: { x: 51.5, y: 28.5 },
    },
    {
      id: "uae",
      number: "05",
      title: "UAE",
      photosCount: 91,
      notesCount: 14,
      date: "Nov 2023",
      imageSrc: "/images/travel/uae.jpg",
      // Dubai
      mapCoordinates: { x: 61.5, y: 44.5 },
    },
    {
      id: "oman",
      number: "06",
      title: "Oman",
      photosCount: 138,
      notesCount: 20,
      date: "Mar 2024",
      imageSrc: "https://media.aknaim.com/travel/oman/highlight.webp",
      // Muscat
      mapCoordinates: { x: 62.5, y: 47.0 },
    },
    {
      id: "india",
      number: "07",
      title: "India",
      photosCount: 111,
      notesCount: 16,
      date: "Feb 2024",
      imageSrc: "https://media.aknaim.com/travel/india/highlight.webp",
      // Lucknow
      mapCoordinates: { x: 68.5, y: 42.5 },
    },
    {
      id: "iceland",
      number: "08",
      title: "Iceland",
      photosCount: 83,
      notesCount: 13,
      date: "Dec 2023",
      imageSrc: "/images/travel/iceland.jpg",
      // Reykjavik
      mapCoordinates: { x: 45.0, y: 21.5 },
    },
    {
      id: "japan",
      number: "09",
      title: "Japan",
      photosCount: 105,
      notesCount: 17,
      date: "Apr 2024",
      imageSrc: "/images/travel/japan.jpg",
      // Tokyo
      mapCoordinates: { x: 84.5, y: 35.5 },
    },
  ];

/** Used by the DB seed script. Prefer `getGalleryItems("travel")` in pages.
 *  Empty on purpose — travel gallery photos come from admin uploads only.
 *  Legacy Oman placeholder ids are pruned on seed (see seed.ts).
 */
export const travelGallerySeedItems: Array<{
  id: string;
  src: string;
  alt: string;
  title: string;
  dateTaken: string;
  year: number;
  filters: Record<string, string>;
}> = [];

/** Oman trip “Moments Along the Way” — kept as trip detail media (not gallery). */
export const omanTripMomentSeeds = [
  {
    title: "Desert Light",
    photoCount: 68,
    imageSrc: "/images/travel/oman/moment-1.jpg",
  },
  {
    title: "Stone Villages",
    photoCount: 54,
    imageSrc: "/images/travel/oman/moment-2.jpg",
  },
  {
    title: "Campfire Nights",
    photoCount: 46,
    imageSrc: "/images/travel/oman/moment-3.jpg",
  },
  {
    title: "Coastal Drives",
    photoCount: 38,
    imageSrc: "/images/travel/oman/moment-4.jpg",
  },
] as const;

export const omanTripRouteMapSrc = "/images/travel/oman/oman-route-map.jpg";

/** Old Oman stock gallery rows — delete on seed so they don’t return. */
export const legacyTravelGallerySeedIds = [
  "oman-hero",
  "oman-m1",
  "oman-m2",
  "oman-m3",
  "oman-m4",
  "oman-f1",
  "oman-f2",
  "oman-f3",
  "oman-gear",
  "oman-route",
] as const;

export { getTripGalleryHref } from "@/lib/db/queries/travel";
