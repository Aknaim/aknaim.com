import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryItems, mediaAssets } from "@/lib/db/schema";
import type { GalleryInterest } from "@/lib/types/gallery";

export type AdminGalleryItem = {
  id: string;
  interest: GalleryInterest;
  title: string | null;
  dateTaken: string;
  filters: Record<string, string>;
  recipeSlug: string | null;
  durationLabel: string | null;
  sortOrder: number;
  published: boolean;
  mediaAssetId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  posterUrl: string | null;
};

export async function listAdminGalleryItems(): Promise<AdminGalleryItem[]> {
  const rows = await db
    .select({
      id: galleryItems.id,
      interest: galleryItems.interest,
      title: galleryItems.title,
      dateTaken: galleryItems.dateTaken,
      filters: galleryItems.filters,
      recipeSlug: galleryItems.recipeSlug,
      durationLabel: galleryItems.durationLabel,
      sortOrder: galleryItems.sortOrder,
      published: galleryItems.published,
      mediaAssetId: galleryItems.mediaAssetId,
      mediaUrl: mediaAssets.url,
      mediaType: mediaAssets.mediaType,
      posterUrl: mediaAssets.posterUrl,
    })
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .orderBy(asc(galleryItems.interest), desc(galleryItems.dateTaken));

  return rows.map((row) => ({
    ...row,
    dateTaken: String(row.dateTaken),
  }));
}

export async function getAdminGalleryItem(id: string): Promise<AdminGalleryItem | null> {
  const [row] = await db
    .select({
      id: galleryItems.id,
      interest: galleryItems.interest,
      title: galleryItems.title,
      dateTaken: galleryItems.dateTaken,
      filters: galleryItems.filters,
      recipeSlug: galleryItems.recipeSlug,
      durationLabel: galleryItems.durationLabel,
      sortOrder: galleryItems.sortOrder,
      published: galleryItems.published,
      mediaAssetId: galleryItems.mediaAssetId,
      mediaUrl: mediaAssets.url,
      mediaType: mediaAssets.mediaType,
      posterUrl: mediaAssets.posterUrl,
    })
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(eq(galleryItems.id, id))
    .limit(1);

  if (!row) return null;
  return { ...row, dateTaken: String(row.dateTaken) };
}
