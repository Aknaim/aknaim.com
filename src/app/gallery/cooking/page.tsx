import type { Metadata } from "next";
import { GalleryView } from "@/components/sections/gallery/GalleryView";
import {
  cookingGalleryConfig,
  cookingGalleryItems,
} from "@/lib/data/galleries/cookingGalleryData";
import { parseGallerySearchParams } from "@/lib/gallery-utils";

export const metadata: Metadata = {
  title: "Cooking Gallery",
};

export default async function CookingGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paramKeys = cookingGalleryConfig.filterGroups.map((g) => g.paramKey);
  const initialFilters = parseGallerySearchParams(params, paramKeys);

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
