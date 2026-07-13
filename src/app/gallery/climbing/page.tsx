import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import { climbingGalleryConfig } from "@/lib/data/galleries/climbingGalleryData";
import { getGalleryItems } from "@/lib/db/queries/gallery";
import { parseGallerySearchParams } from "@/lib/gallery-utils";

export const metadata: Metadata = {
  title: "Climbing Gallery",
};

export default async function ClimbingGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paramKeys = climbingGalleryConfig.filterGroups.map((g) => g.paramKey);
  const initialFilters = parseGallerySearchParams(params, paramKeys);
  const climbingGalleryItems = await getGalleryItems("climbing", initialFilters);

  return (
    <GalleryView
      config={climbingGalleryConfig}
      items={climbingGalleryItems}
      initialFilters={initialFilters}
      backHref="/climbing"
      backLabel="← Back to Climbing"
      showDuration
    />
  );
}
