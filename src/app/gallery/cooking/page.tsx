import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import { cookingGalleryConfig } from "@/lib/data/galleries/cookingGalleryData";
import { getGalleryItems } from "@/lib/db/queries/gallery";
import { parseGallerySearchParams } from "@/lib/gallery-utils";

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
  // Load the full set; GalleryView filters client-side so URL sync can't empty the grid.
  const cookingGalleryItems = await getGalleryItems("cooking");

  return (
    <GalleryView
      config={cookingGalleryConfig}
      items={cookingGalleryItems}
      initialFilters={initialFilters}
      backHref="/cooking"
      backLabel="← Back to Cooking"
    />
  );
}
