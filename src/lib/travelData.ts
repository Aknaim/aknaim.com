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
      date: "May 2024",
      imageSrc: "/images/travel/canada.jpg",
      mapCoordinates: { x: 31.5, y: 32.5 },
    },
    {
      id: "usa",
      number: "02",
      title: "United States",
      photosCount: 156,
      notesCount: 18,
      date: "Sep 2023",
      imageSrc: "/images/travel/usa.jpg",
      mapCoordinates: { x: 23.5, y: 35.0 },
    },
    {
      id: "russia",
      number: "03",
      title: "Russia",
      photosCount: 72,
      notesCount: 9,
      date: "Jan 2023",
      imageSrc: "/images/travel/russia.jpg",
      mapCoordinates: { x: 57.0, y: 24.5 },
    },
    {
      id: "germany",
      number: "04",
      title: "Germany",
      photosCount: 64,
      notesCount: 11,
      date: "Jun 2023",
      imageSrc: "/images/travel/germany.jpg",
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
      mapCoordinates: { x: 61.2, y: 44.5 },
    },
    {
      id: "oman",
      number: "06",
      title: "Oman",
      photosCount: 138,
      notesCount: 20,
      date: "Mar 2024",
      imageSrc: "https://media.aknaim.com/travel/oman/highlight.webp",
      mapCoordinates: { x: 61.8, y: 47.5 },
    },
    {
      id: "india",
      number: "07",
      title: "India",
      photosCount: 111,
      notesCount: 16,
      date: "Feb 2024",
      imageSrc: "https://media.aknaim.com/travel/india/highlight.webp",
      mapCoordinates: { x: 68.2, y: 42.0 },
    },
    {
      id: "iceland",
      number: "08",
      title: "Iceland",
      photosCount: 83,
      notesCount: 13,
      date: "Dec 2023",
      imageSrc: "/images/travel/iceland.jpg",
      mapCoordinates: { x: 44.5, y: 20.5 },
    },
    {
      id: "japan",
      number: "09",
      title: "Japan",
      photosCount: 105,
      notesCount: 17,
      date: "Apr 2024",
      imageSrc: "/images/travel/japan.jpg",
      mapCoordinates: { x: 84.0, y: 35.5 },
    },
  ];

const omanPhotos = [
  { id: "oman-hero", src: "/images/travel/oman/hero-oman.jpg", alt: "Oman landscape at golden hour", title: "Golden Hour", dateTaken: "2025-03-02", year: 2025, filters: { trip: "oman", category: "landscapes" } },
  { id: "oman-m1", src: "/images/travel/oman/moment-1.jpg", alt: "Desert light across Wahiba Sands", title: "Desert Light", dateTaken: "2025-03-04", year: 2025, filters: { trip: "oman", category: "landscapes" } },
  { id: "oman-m2", src: "/images/travel/oman/moment-2.jpg", alt: "Stone villages in the mountains", title: "Stone Villages", dateTaken: "2025-03-06", year: 2025, filters: { trip: "oman", category: "architecture" } },
  { id: "oman-m3", src: "/images/travel/oman/moment-3.jpg", alt: "Campfire under desert stars", title: "Campfire Nights", dateTaken: "2025-03-05", year: 2025, filters: { trip: "oman", category: "portraits" } },
  { id: "oman-m4", src: "/images/travel/oman/moment-4.jpg", alt: "Coastal road along the Arabian Sea", title: "Coastal Drives", dateTaken: "2025-03-08", year: 2025, filters: { trip: "oman", category: "landscapes" } },
  { id: "oman-f1", src: "/images/travel/oman/food-1.jpg", alt: "Desert camp dinner", title: "Desert Camp", dateTaken: "2025-03-05", year: 2025, filters: { trip: "oman", category: "food" } },
  { id: "oman-f2", src: "/images/travel/oman/food-2.jpg", alt: "Lamb shuwa in Nizwa", title: "Lamb Shuwa", dateTaken: "2025-03-06", year: 2025, filters: { trip: "oman", category: "food" } },
  { id: "oman-f3", src: "/images/travel/oman/food-3.jpg", alt: "Roadside karak tea", title: "Roadside Karak", dateTaken: "2025-03-07", year: 2025, filters: { trip: "oman", category: "food" } },
  { id: "oman-gear", src: "/images/travel/oman/gear-flatlay.jpg", alt: "Travel gear flatlay", title: "Gear Flatlay", dateTaken: "2025-03-01", year: 2025, filters: { trip: "oman", category: "details" } },
  { id: "oman-route", src: "/images/travel/oman/oman-route-map.jpg", alt: "Oman route map", title: "The Route", dateTaken: "2025-03-01", year: 2025, filters: { trip: "oman", category: "details" } },
];

/** Used by the DB seed script. Prefer `getGalleryItems("travel")` in pages.
 *  Only Oman ships with curated seed photos — other countries get real uploads via admin.
 */
export const travelGallerySeedItems = [...omanPhotos];

export { getTripGalleryHref } from "@/lib/db/queries/travel";
