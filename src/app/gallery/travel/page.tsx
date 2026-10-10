import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import {
  GALLERY_PAGE_SIZE,
  getGalleryPage,
} from "@/lib/db/queries/gallery";
import { getTravelGalleryConfig } from "@/lib/db/queries/travel";
import {
  buildGalleryQueryString,
  parseGallerySearchParams,
} from "@/lib/gallery-utils";

export const metadata: Metadata = {
  title: "Travel Gallery",
};

export const revalidate = 60;

export default async function TravelGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const travelGalleryConfig = await getTravelGalleryConfig();
  const paramKeys = travelGalleryConfig.filterGroups.map((g) => g.paramKey);
  const initialFilters = parseGallerySearchParams(params, paramKeys);
  const sort = initialFilters.sort ?? travelGalleryConfig.defaultSort;

  const page = await getGalleryPage({
    interest: "travel",
    filters: initialFilters,
    sort,
    limit: GALLERY_PAGE_SIZE,
    offset: 0,
  });

  const backHref = initialFilters.trip ? `/travel/${initialFilters.trip}` : "/travel";
  const backLabel = initialFilters.trip ? "← Back to Trip" : "← Back to Travel";

  return (
    <GalleryView
      // Remount when URL filters change so scroll state doesn't leak across trips.
      key={buildGalleryQueryString(initialFilters) || "all"}
      config={travelGalleryConfig}
      items={page.items}
      initialFilters={initialFilters}
      backHref={backHref}
      backLabel={backLabel}
      pagination={{
        pageSize: GALLERY_PAGE_SIZE,
        total: page.total,
        hasMore: page.hasMore,
      }}
    />
  );
}
