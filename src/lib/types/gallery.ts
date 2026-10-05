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
  /** Start collapsed; expand on click. Useful for long secondary filters like color. */
  defaultCollapsed?: boolean;
}

export interface GalleryConfig {
  interest: GalleryInterest;
  title: string;
  subtitle: string;
  filterGroups: FilterGroup[];
  sortOptions: FilterOption[];
  defaultSort: string;
  /**
   * When set, sidebar + header counts unique values of this filter key
   * (e.g. climb slug) instead of raw photo/video items.
   */
  countDistinctKey?: string;
  /** Nouns for the summary line when counting distinct entities */
  summaryNoun?: { singular: string; plural: string };
}

export type GalleryFilters = Record<string, string>;

export type GalleryViewMode = "grid" | "list";
