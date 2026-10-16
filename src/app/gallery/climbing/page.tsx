import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import { climbingGalleryConfig } from "@/lib/data/galleries/climbingGalleryData";
import {
  GALLERY_PAGE_SIZE,
  getGalleryFilterIndex,
  getGalleryPage,
} from "@/lib/db/queries/gallery";
import {
  buildGalleryQueryString,
  parseGallerySearchParams,
} from "@/lib/gallery-utils";

export const metadata: Metadata = {
  title: "Climbing Gallery",
};

export const revalidate = 60;

export default async function ClimbingGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paramKeys = [
    ...climbingGalleryConfig.filterGroups.map((g) => g.paramKey),
    // Deep-link from progression milestones → that climb’s send media
    "climb",
  ];
  const initialFilters = parseGallerySearchParams(params, paramKeys);
  const sort = initialFilters.sort ?? climbingGalleryConfig.defaultSort;

  const [page, filterIndex] = await Promise.all([
    getGalleryPage({
      interest: "climbing",
      filters: initialFilters,
      sort,
      limit: GALLERY_PAGE_SIZE,
      offset: 0,
      countDistinctKey: climbingGalleryConfig.countDistinctKey,
    }),
    getGalleryFilterIndex("climbing"),
  ]);

  return (
    <GalleryView
      key={buildGalleryQueryString(initialFilters) || "all"}
      config={climbingGalleryConfig}
      items={page.items}
      initialFilters={initialFilters}
      backHref="/climbing"
      backLabel="← Back to Climbing"
      showDuration
      filterIndex={filterIndex}
      pagination={{
        pageSize: GALLERY_PAGE_SIZE,
        total: page.total,
        totalDistinct: page.totalDistinct,
        hasMore: page.hasMore,
      }}
    />
  );
}
