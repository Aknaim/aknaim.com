import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";

export type MediaAssetRow = {
  id: string;
  url: string;
  alt: string | null;
  mediaType: "image" | "video";
  posterUrl: string | null;
  durationLabel: string | null;
  createdAt: Date;
};

export async function listMediaAssets(limit = 100): Promise<MediaAssetRow[]> {
  return db
    .select({
      id: mediaAssets.id,
      url: mediaAssets.url,
      alt: mediaAssets.alt,
      mediaType: mediaAssets.mediaType,
      posterUrl: mediaAssets.posterUrl,
      durationLabel: mediaAssets.durationLabel,
      createdAt: mediaAssets.createdAt,
    })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(limit);
}

export async function getMediaAssetById(id: string): Promise<MediaAssetRow | null> {
  const [row] = await db
    .select({
      id: mediaAssets.id,
      url: mediaAssets.url,
      alt: mediaAssets.alt,
      mediaType: mediaAssets.mediaType,
      posterUrl: mediaAssets.posterUrl,
      durationLabel: mediaAssets.durationLabel,
      createdAt: mediaAssets.createdAt,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return row ?? null;
}

export async function countMediaAssets(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(mediaAssets);
  return row?.value ?? 0;
}
