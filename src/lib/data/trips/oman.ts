import { TripDetail } from "@/lib/types/travel";

export const omanTripData: TripDetail = {
  id: "oman",
  country: "Oman",
  date: "March 2025",
  summary: "10 days across wadis, mountains, and desert roads.",
  heroImage: "/images/travel/oman/hero-oman.jpg",
  stats: { days: 10, stops: 4, photos: 248 },
  route: {
    mapImage: "/images/travel/oman/oman-route-map.jpg",
    note: "A loop through contrast. Mountains to desert. Old roads and open spaces. Plenty of chai.",
    stops: [
      { name: "Muscat", coordinates: { x: 52, y: 32 } },
      { name: "Nizwa", coordinates: { x: 44, y: 45 } },
      { name: "Wahiba Sands", coordinates: { x: 58, y: 55 } },
      { name: "Jebel Akhdar", coordinates: { x: 35, y: 58 } },
    ],
  },
  timeline: [],
  moments: [
    { title: "Desert Light", photoCount: 68, imageSrc: "/images/travel/oman/moment-1.jpg" },
    { title: "Stone Villages", photoCount: 54, imageSrc: "/images/travel/oman/moment-2.jpg" },
    { title: "Campfire Nights", photoCount: 46, imageSrc: "/images/travel/oman/moment-3.jpg" },
    { title: "Coastal Drives", photoCount: 38, imageSrc: "/images/travel/oman/moment-4.jpg" },
  ],
  fieldNotes: [
    "The mountains felt colder than expected after sunset.",
    "Roadside coffee stops became part of the rhythm of the trip.",
    "The silence in the desert never felt empty."
  ],
  favoritePlaces: [
    { title: "Desert Camp", location: "in Muscat", description: "Stary nights and sand.", imageSrc: "/images/travel/oman/food-1.jpg" },
    { title: "Lamb Shuwa", location: "in Nizwa", description: "Slow cooked to perfection.", imageSrc: "/images/travel/oman/food-2.jpg" },
    { title: "Roadside Karak", location: "Everywhere", description: "Simple. Perfect.", imageSrc: "/images/travel/oman/food-3.jpg" },
  ],
  gearImage: "/images/travel/oman/gear-flatlay.jpg",
  reflection: {
    excerpt: "Traveling slower changed how I experience places.",
    slug: "traveling-slower-oman"
  }
};