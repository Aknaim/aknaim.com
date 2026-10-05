import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import { getGalleryItems } from "@/lib/db/queries/gallery";
import { getTravelGalleryConfig } from "@/lib/db/queries/travel";
import { parseGallerySearchParams } from "@/lib/gallery-utils";

export const metadata: Metadata = {
  title: "Travel Gallery",
};

export const dynamic = "force-dynamic";

export default async function TravelGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const travelGalleryConfig = await getTravelGalleryConfig();
  const paramKeys = travelGalleryConfig.filterGroups.map((g) => g.paramKey);
  const initialFilters = parseGallerySearchParams(params, paramKeys);
  // Load the full set; GalleryView filters client-side so URL sync can't empty the grid.
  const travelGalleryItems = await getGalleryItems("travel");

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
