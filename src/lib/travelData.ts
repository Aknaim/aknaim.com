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
  }
  
  export const travelStats = {
    places: 9,
    photos: "25k+",
    notes: "120+",
    memories: "∞",
  };
  
  export const destinations: Destination[] = [
    {
      id: "toronto",
      number: "01",
      title: "Toronto, Canada",
      photosCount: 48,
      notesCount: 12,
      date: "May 2024",
      imageSrc: "/images/travel/toronto.jpg",
      mapCoordinates: { x: 31.5, y: 32.5 }, // Snaps cleanly to the Great Lakes region
    },
    {
      id: "usa",
      number: "02",
      title: "USA",
      photosCount: 156,
      notesCount: 18,
      date: "Sep 2023",
      imageSrc: "/images/travel/usa.jpg",
      mapCoordinates: { x: 23.5, y: 35.0 }, // Places the pin firmly in the American West/Rockies
    },
    {
      id: "moscow",
      number: "03",
      title: "Moscow, Russia",
      photosCount: 72,
      notesCount: 9,
      date: "Jan 2023",
      imageSrc: "/images/travel/moscow.jpg",
      mapCoordinates: { x: 57.0, y: 24.5 }, // Shifts left and up to Western Russia
    },
    {
      id: "berlin",
      number: "04",
      title: "Berlin, Germany",
      photosCount: 64,
      notesCount: 11,
      date: "Jun 2023",
      imageSrc: "/images/travel/berlin.jpg",
      mapCoordinates: { x: 51.5, y: 28.5 }, // Drops right into Central Europe
    },
    {
      id: "uae",
      number: "05",
      title: "UAE",
      photosCount: 91,
      notesCount: 14,
      date: "Nov 2023",
      imageSrc: "/images/travel/uae.jpg",
      mapCoordinates: { x: 61.2, y: 44.5 }, // Locks perfectly onto the Persian Gulf tip
    },
    {
      id: "oman",
      number: "06",
      title: "Oman",
      photosCount: 138,
      notesCount: 20,
      date: "Mar 2024",
      imageSrc: "/images/travel/oman.jpg",
      mapCoordinates: { x: 61.8, y: 47.5 }, // Pulls way up from Africa to sit directly below UAE on the Arabian Peninsula
    },
    {
      id: "delhi",
      number: "07",
      title: "Delhi, India",
      photosCount: 111,
      notesCount: 16,
      date: "Feb 2024",
      imageSrc: "/images/travel/delhi.jpg",
      mapCoordinates: { x: 68.2, y: 42.0 }, // Places it accurately in Northern India
    },
    {
      id: "iceland",
      number: "08",
      title: "Iceland",
      photosCount: 83,
      notesCount: 13,
      date: "Dec 2023",
      imageSrc: "/images/travel/iceland.jpg",
      mapCoordinates: { x: 44.5, y: 20.5 }, // Moves northwest into the North Atlantic island pocket
    },
    {
      id: "japan",
      number: "09",
      title: "Japan",
      photosCount: 105,
      notesCount: 17,
      date: "Apr 2024",
      imageSrc: "/images/travel/japan.jpg",
      mapCoordinates: { x: 84.0, y: 35.5 }, // Perfectly centers on the main island of Honshu
    },
  ];