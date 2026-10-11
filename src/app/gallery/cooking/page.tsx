import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import { cookingGalleryConfig } from "@/lib/data/galleries/cookingGalleryData";
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
  title: "Cooking Gallery",
};

export const revalidate = 60;

export default async function CookingGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paramKeys = cookingGalleryConfig.filterGroups.map((g) => g.paramKey);
  const initialFilters = parseGallerySearchParams(params, paramKeys);
  const sort = initialFilters.sort ?? cookingGalleryConfig.defaultSort;

  const [page, filterIndex] = await Promise.all([
    getGalleryPage({
      interest: "cooking",
      filters: initialFilters,
      sort,
      limit: GALLERY_PAGE_SIZE,
      offset: 0,
    }),
    getGalleryFilterIndex("cooking"),
  ]);

  return (
    <GalleryView
      key={buildGalleryQueryString(initialFilters) || "all"}
      config={cookingGalleryConfig}
      items={page.items}
      initialFilters={initialFilters}
      backHref="/cooking"
      backLabel="← Back to Cooking"
      filterIndex={filterIndex}
      pagination={{
        pageSize: GALLERY_PAGE_SIZE,
        total: page.total,
        hasMore: page.hasMore,
      }}
    />
  );
}
