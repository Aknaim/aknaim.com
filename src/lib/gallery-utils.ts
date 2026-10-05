import { gradeFromFilterKey } from "@/lib/climbing-grades";
import { parseGrade } from "@/lib/climbing-progression";
import type { GalleryFilters, GalleryItem } from "@/lib/types/gallery";

export function filterGalleryItems(
  items: GalleryItem[],
  filters: GalleryFilters
): GalleryItem[] {
  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value || value === "all") return true;
      return item.filters[key] === value;
    })
  );
}

function distinctCount(items: GalleryItem[], distinctKey?: string): number {
  if (!distinctKey) return items.length;
  const keys = new Set<string>();
  for (const item of items) {
    const value = item.filters[distinctKey];
    if (value) keys.add(value);
  }
  return keys.size;
}

export function sortGalleryItems(
  items: GalleryItem[],
  sortId: string
): GalleryItem[] {
  const sorted = [...items];

  switch (sortId) {
    case "date-asc":
      return sorted.sort((a, b) => a.dateTaken.localeCompare(b.dateTaken));
    case "title-asc":
      return sorted.sort((a, b) => (a.title ?? a.alt).localeCompare(b.title ?? b.alt));
    case "grade-desc": {
      return sorted.sort((a, b) => {
        const pa = parseGrade(gradeFromFilterKey(a.filters.grade ?? ""));
        const pb = parseGrade(gradeFromFilterKey(b.filters.grade ?? ""));
        const aKind = pa?.kind === "boulder" ? 0 : 1;
        const bKind = pb?.kind === "boulder" ? 0 : 1;
        if (aKind !== bKind) return aKind - bKind;
        const ar = pa?.rank ?? -1;
        const br = pb?.rank ?? -1;
        if (br !== ar) return br - ar;
        return b.dateTaken.localeCompare(a.dateTaken);
      });
    }
    case "date-desc":
    default:
      return sorted.sort((a, b) => b.dateTaken.localeCompare(a.dateTaken));
  }
}

export function countItemsForFilter(
  items: GalleryItem[],
  paramKey: string,
  optionId: string,
  activeFilters: GalleryFilters,
  distinctKey?: string
): number {
  const otherFilters = { ...activeFilters };
  delete otherFilters[paramKey];
  delete otherFilters.sort;

  const matched = filterGalleryItems(items, otherFilters).filter(
    (item) => item.filters[paramKey] === optionId
  );
  return distinctCount(matched, distinctKey);
}

export function countAllForFilterGroup(
  items: GalleryItem[],
  paramKey: string,
  activeFilters: GalleryFilters,
  distinctKey?: string
): number {
  const otherFilters = { ...activeFilters };
  delete otherFilters[paramKey];
  delete otherFilters.sort;

  return distinctCount(filterGalleryItems(items, otherFilters), distinctKey);
}

export function parseGallerySearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  paramKeys: string[]
): GalleryFilters {
  const filters: GalleryFilters = {};

  for (const key of paramKeys) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) filters[key] = value;
  }

  const sortRaw = searchParams.sort;
  const sort = Array.isArray(sortRaw) ? sortRaw[0] : sortRaw;
  if (sort) filters.sort = sort;

  return filters;
}

export function buildGalleryQueryString(filters: GalleryFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== "all") params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
