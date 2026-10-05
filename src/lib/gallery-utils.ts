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
      const gradeOrder = [
        "v10",
        "v9",
        "v8",
        "v7",
        "v6",
        "v5",
        "v4",
        "v3",
        "v2",
        "v1",
        "v0",
        "5-13",
        "5-12",
        "5-11",
        "5-10",
        "5-9",
        "5-8",
        "5-7",
        "5-6",
        "5-5",
      ];
      return sorted.sort((a, b) => {
        const ai = gradeOrder.indexOf(a.filters.grade ?? "");
        const bi = gradeOrder.indexOf(b.filters.grade ?? "");
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
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
  activeFilters: GalleryFilters
): number {
  const otherFilters = { ...activeFilters };
  delete otherFilters[paramKey];
  delete otherFilters.sort;

  return filterGalleryItems(items, otherFilters).filter(
    (item) => item.filters[paramKey] === optionId
  ).length;
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
