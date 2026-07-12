import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import {
  travelGalleryConfig,
  travelGalleryItems,
} from "@/lib/data/galleries/travelGalleryData";
import { parseGallerySearchParams } from "@/lib/gallery-utils";

export const metadata: Metadata = {
  title: "Travel Gallery",
};

export default async function TravelGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paramKeys = travelGalleryConfig.filterGroups.map((g) => g.paramKey);
  const initialFilters = parseGallerySearchParams(params, paramKeys);

  const backHref = initialFilters.trip ? `/travel/${initialFilters.trip}` : "/travel";
  const backLabel = initialFilters.trip ? "← Back to Trip" : "← Back to Travel";

  return (
    <GalleryView
      config={travelGalleryConfig}
      items={travelGalleryItems}
      initialFilters={initialFilters}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
