"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";

/** Ensure a media_assets row exists for a URL (paste path or existing R2 URL). */
export async function ensureMediaAssetId(
  url: string,
  alt?: string,
  mediaType: "image" | "video" = "image"
): Promise<string> {
  const existing = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.url, url))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(mediaAssets)
    .values({ url, alt: alt ?? null, mediaType })
    .returning();
  return row.id;
}
