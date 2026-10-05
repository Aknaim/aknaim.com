export type GalleryInterest = "travel" | "climbing" | "cooking";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  dateTaken: string;
  year: number;
  /** Interest-specific filter keys, e.g. trip, category, location, grade */
  filters: Record<string, string>;
  /** Optional duration label for video-style items (climbing) */
  duration?: string;
  mediaType?: "image" | "video";
  /** Poster frame for video thumbs */
  posterSrc?: string;
  /** Links gallery photo to a recipe detail page */
  recipeSlug?: string;
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: "list" | "select";
  paramKey: string;
  options: FilterOption[];
  allowAll?: boolean;
}

export interface GalleryConfig {
  interest: GalleryInterest;
  title: string;
  subtitle: string;
  filterGroups: FilterGroup[];
  sortOptions: FilterOption[];
  defaultSort: string;
}

export type GalleryFilters = Record<string, string>;

export type GalleryViewMode = "grid" | "list";
