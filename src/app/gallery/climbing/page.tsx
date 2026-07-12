import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import {
  climbingGalleryConfig,
  climbingGalleryItems,
} from "@/lib/data/galleries/climbingGalleryData";
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

  const backHref = "/climbing";
  const backLabel = "← Back to Climbing";

  return (
    <GalleryView
      config={climbingGalleryConfig}
      items={climbingGalleryItems}
      initialFilters={initialFilters}
      backHref={backHref}
      backLabel={backLabel}
      showDuration
    />
  );
}
