import { NextResponse } from "next/server";
import {
  GALLERY_PAGE_SIZE,
  getGalleryPage,
} from "@/lib/db/queries/gallery";
import type { GalleryInterest } from "@/lib/types/gallery";

const INTERESTS = new Set<GalleryInterest>(["travel", "climbing", "cooking"]);

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ interest: string }> }
) {
  const { interest: rawInterest } = await context.params;
  if (!INTERESTS.has(rawInterest as GalleryInterest)) {
    return NextResponse.json({ error: "Unknown gallery." }, { status: 404 });
  }
  const interest = rawInterest as GalleryInterest;

  const url = new URL(request.url);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = Number.parseInt(
    url.searchParams.get("limit") ?? String(GALLERY_PAGE_SIZE),
    10
  );
  const sort = url.searchParams.get("sort") ?? undefined;

  const filters: Record<string, string> = {};
  for (const key of [
    "trip",
    "year",
    "category",
    "location",
    "grade",
    "climb",
    "color",
    "type",
    "cuisine",
  ]) {
    const value = url.searchParams.get(key);
    if (value) filters[key] = value;
  }

  try {
    const page = await getGalleryPage({
      interest,
      filters,
      sort,
      offset: Number.isFinite(offset) ? offset : 0,
      limit: Number.isFinite(limit) ? limit : GALLERY_PAGE_SIZE,
    });
    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gallery load failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
