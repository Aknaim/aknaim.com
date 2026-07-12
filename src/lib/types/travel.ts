export interface RouteStop {
    name: string;
    coordinates: { x: number; y: number };
  }
  
  export interface TimelineMilestone {
    day: string;
    label: string;
  }
  
  export interface GalleryMoment {
    title: string;
    photoCount: number;
    imageSrc: string;
  }
  
  export interface LocalHighlight {
    title: string;
    location: string;
    description: string;
    imageSrc: string;
  }
  
  export interface TripDetail {
    id: string;
    country: string;
    date: string;
    summary: string;
    heroImage: string;
    stats: {
      days: number;
      regions: number;
      photos: number;
      countries: number;
    };
    route: {
      mapImage: string;
      stops: RouteStop[];
    };
    timeline: TimelineMilestone[];
    moments: GalleryMoment[];
    fieldNotes: string[];
    favoritePlaces: LocalHighlight[];
    gearImage: string;
    reflection: {
      excerpt: string;
      slug: string;
    };
  }