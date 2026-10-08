"use server";

import { eq } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  destinations,
  galleryItems,
  mediaAssets,
  tripMoments,
  tripRouteStops,
  trips,
  tripTimeline,
} from "@/lib/db/schema";
import { countDestinations } from "@/lib/db/queries/travel";
import { tripMediaPaths } from "@/lib/media/trip-paths";
import { ensureMediaAssetId } from "./ensure-media-asset";
import { requireAdminAction } from "./require-admin";

export type TravelPlaceSaveState = { error: string } | null;

async function mediaStorage() {
  return import("@/lib/media/storage");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripUrlQuery(url: string) {
  const i = url.indexOf("?");
  return i >= 0 ? url.slice(0, i) : url;
}

/** Place names from routePlace_0, routePlace_1, … Coords unused (no map pins). */
function parseRoutePlaces(formData: FormData) {
  const places: Array<{ name: string; sortOrder: number }> = [];
  for (const [key, value] of formData.entries()) {
    const match = /^routePlace_(\d+)$/.exec(key);
    if (!match) continue;
    const name = String(value ?? "").trim();
    if (!name) continue;
    places.push({ name, sortOrder: Number(match[1]) });
  }
  places.sort((a, b) => a.sortOrder - b.sortOrder);
  return places.map((place, index) => ({ name: place.name, sortOrder: index }));
}

type GalleryUploadRef = { url: string; mediaId: string; name: string };

function parseGalleryUploads(raw: string): GalleryUploadRef[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const url = typeof row.url === "string" ? row.url.trim() : "";
        const mediaId = typeof row.mediaId === "string" ? row.mediaId.trim() : "";
        const name = typeof row.name === "string" ? row.name.trim() : "photo";
        if (!url && !mediaId) return null;
        return { url, mediaId, name };
      })
      .filter((item): item is GalleryUploadRef => item != null);
  } catch {
    return [];
  }
}

/** Move upload into travel/{id}/canonical name (local or R2), same pattern as climbs. */
async function settleTravelAsset(
  url: string,
  folder: string,
  fileName: string,
  existingId: string,
  alt: string
): Promise<{ id: string; url: string }> {
  const cleanUrl = stripUrlQuery(url);
  const destFolder = folder.replace(/^\/+|\/+$/g, "");
  const destName =
    fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "") || "file";
  const alreadyCanonical = cleanUrl.includes(`/${destFolder}/${destName}`);

  // Fast path: upload already wrote the canonical key + we have its media id.
  if (alreadyCanonical && existingId) {
    await db
      .update(mediaAssets)
      .set({ createdAt: new Date(), alt })
      .where(eq(mediaAssets.id, existingId));
    return { id: existingId, url: cleanUrl };
  }

  let finalUrl = cleanUrl;

  if (cleanUrl.startsWith("/media/")) {
    const { relocateLocalMediaUrl } = await mediaStorage();
    finalUrl = await relocateLocalMediaUrl(cleanUrl, folder, fileName);
  } else if (cleanUrl.startsWith("/images/")) {
    // Legacy public path — keep as-is unless a new /media or R2 upload replaced it.
    finalUrl = cleanUrl;
  } else if (!alreadyCanonical) {
    try {
      const { getR2PublicBaseUrl, relocateR2PublicUrl } = await import("@/lib/media/r2");
      if (cleanUrl.startsWith(`${getR2PublicBaseUrl()}/`)) {
        finalUrl = await relocateR2PublicUrl(cleanUrl, folder, fileName);
      }
    } catch {
      finalUrl = cleanUrl;
    }
  }

  if (existingId) {
    if (finalUrl !== cleanUrl) {
      await db
        .update(mediaAssets)
        .set({ url: finalUrl, createdAt: new Date(), alt })
        .where(eq(mediaAssets.id, existingId));
    } else {
      await db
        .update(mediaAssets)
        .set({ createdAt: new Date(), alt })
        .where(eq(mediaAssets.id, existingId));
    }
    return { id: existingId, url: finalUrl };
  }

  const [owner] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.url, finalUrl))
    .limit(1);

  if (owner) {
    await db
      .update(mediaAssets)
      .set({ createdAt: new Date(), alt })
      .where(eq(mediaAssets.id, owner.id));
    return { id: owner.id, url: finalUrl };
  }

  const id = await ensureMediaAssetId(finalUrl, alt);
  return { id, url: finalUrl };
}

function dateTakenFromFilename(name: string): string {
  // Camera dumps like 20240301_174309.jpg → 2024-03-01
  const match = name.match(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?:[_\D]|$)/);
  if (match) {
    const [, y, m, d] = match;
    return `${y}-${m}-${d}`;
  }
  return new Date().toISOString().slice(0, 10);
}

async function attachTripGalleryUploads(tripId: string, uploads: GalleryUploadRef[]) {
  if (uploads.length === 0) return;

  const paths = tripMediaPaths(tripId);
  const existing = await db
    .select({ sortOrder: galleryItems.sortOrder })
    .from(galleryItems)
    .where(eq(galleryItems.interest, "travel"));
  let sortOrder = existing.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1;

  for (const upload of uploads) {
    const stem = upload.name.replace(/\.[^.]+$/, "");
    const base = slugify(stem) || "photo";
    const id = `travel-${tripId}-${base}`;
    try {
      const settled = await settleTravelAsset(
        upload.url,
        paths.galleryFolder,
        `${base}.webp`,
        upload.mediaId,
        upload.name
      );

      await db
        .insert(galleryItems)
        .values({
          id,
          interest: "travel",
          mediaAssetId: settled.id,
          title: stem,
          dateTaken: dateTakenFromFilename(upload.name),
          filters: { trip: tripId },
          sortOrder,
          published: true,
        })
        .onConflictDoUpdate({
          target: galleryItems.id,
          set: {
            mediaAssetId: settled.id,
            title: stem,
            dateTaken: dateTakenFromFilename(upload.name),
            filters: { trip: tripId },
            published: true,
          },
        });
      sortOrder += 1;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown error";
      throw new Error(`Gallery attach failed for ${upload.name}: ${detail}`);
    }
  }
}

/**
 * One place = destination card on /travel + optional detail at /travel/[id].
 *
 * Required for every save: title, date, highlight image.
 * Detail page is created when summary is filled (hero → highlight, map → hero if omitted).
 * Empty summary = card only ("Coming soon"); does not require a publish checkbox.
 */
export async function createOrUpdateTravelPlace(
  _prev: TravelPlaceSaveState,
  formData: FormData
): Promise<TravelPlaceSaveState> {
  try {
    await requireAdminAction();

    const idInput = String(formData.get("id") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    // Persist ISO in date_label; public pages format to "Mar 2025".
    const dateLabel = String(
      formData.get("occurredOn") ?? formData.get("dateLabel") ?? ""
    ).trim();
    const imageUrl = stripUrlQuery(String(formData.get("imageUrl") ?? "").trim());
    const imageMediaIdInput = String(formData.get("imageMediaId") ?? "").trim();
    const mapX = Number(formData.get("mapX") ?? 50);
    const mapY = Number(formData.get("mapY") ?? 50);
    const summary = String(formData.get("summary") ?? "").trim();
    const routeNote = String(formData.get("routeNote") ?? "").trim();
    const heroUrl = stripUrlQuery(String(formData.get("heroUrl") ?? "").trim());
    const heroMediaIdInput = String(formData.get("heroMediaId") ?? "").trim();
    const routeMapUrl = stripUrlQuery(String(formData.get("routeMapUrl") ?? "").trim());
    const routeMapMediaIdInput = String(formData.get("routeMapMediaId") ?? "").trim();
    const daysRaw = String(formData.get("days") ?? "").trim();
    const daysParsed = Number(daysRaw);
    const days = Number.isFinite(daysParsed) && daysParsed > 0 ? Math.round(daysParsed) : 0;

    const routePlacesPreview = parseRoutePlaces(formData);

    const hasDetailExtras =
      Boolean(heroUrl || heroMediaIdInput) ||
      Boolean(routeMapUrl || routeMapMediaIdInput) ||
      Boolean(routeNote) ||
      routePlacesPreview.length > 0 ||
      days > 0 ||
      Boolean(String(formData.get("galleryUploads") ?? "").trim()) ||
      [0, 1, 2, 3].some((index) => {
        const momentTitle = String(formData.get(`momentTitle_${index}`) ?? "").trim();
        const momentUrl = String(formData.get(`momentUrl_${index}`) ?? "").trim();
        const momentMediaId = String(formData.get(`momentMediaId_${index}`) ?? "").trim();
        return Boolean(momentTitle || momentUrl || momentMediaId);
      });

    if (!title || !dateLabel || (!imageUrl && !imageMediaIdInput)) {
      return { error: "Title, date, and highlight image are required." };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateLabel)) {
      return { error: "Date must be a valid calendar date." };
    }

    // Detail content without a summary is almost always a forgotten summary.
    if (!summary && hasDetailExtras) {
      return {
        error:
          "Add a summary to publish the detail page (or clear detail fields to keep this card-only).",
      };
    }

    const id = idInput || slugify(title);
    if (!id) {
      return { error: "Could not derive a place id from the title." };
    }

    const paths = tripMediaPaths(id);

    const highlight = await settleTravelAsset(
      imageUrl || (await mediaUrlForId(imageMediaIdInput)),
      paths.highlightFolder,
      paths.highlightFile,
      imageMediaIdInput,
      title
    );
    const imageMediaId = highlight.id;

    const [existingDest] = await db
      .select({
        photosCount: destinations.photosCount,
        notesCount: destinations.notesCount,
        sortOrder: destinations.sortOrder,
        displayNumber: destinations.displayNumber,
        subtitle: destinations.subtitle,
      })
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);

    // Legacy NOT NULL column — kept filled, no longer shown in admin/UI.
    const displayNumber =
      existingDest?.displayNumber ||
      String((await countDestinations()) + 1).padStart(2, "0");

    await db
      .insert(destinations)
      .values({
        id,
        displayNumber,
        title,
        subtitle: existingDest?.subtitle ?? null,
        photosCount: existingDest?.photosCount ?? 0,
        notesCount: existingDest?.notesCount ?? 0,
        dateLabel,
        imageMediaId,
        mapX: Number.isFinite(mapX) ? mapX : 50,
        mapY: Number.isFinite(mapY) ? mapY : 50,
        sortOrder: existingDest?.sortOrder ?? 0,
      })
      .onConflictDoUpdate({
        target: destinations.id,
        set: {
          title,
          dateLabel,
          imageMediaId,
          mapX: Number.isFinite(mapX) ? mapX : 50,
          mapY: Number.isFinite(mapY) ? mapY : 50,
        },
      });

    // No summary → card only on /travel ("Coming soon").
    if (!summary) {
      await db.delete(trips).where(eq(trips.id, id));
      revalidateTravel(id);
      redirect(`/admin/travel/${id}?saved=1`);
    }

    // Reuse highlight/hero media when optional slots are blank.
    // Never relocate-as-move between canonical travel files — that deletes
    // highlight.webp / hero.webp while other rows still point at them.
    const hero =
      heroUrl || heroMediaIdInput
        ? await settleTravelAsset(
            heroUrl || (await mediaUrlForId(heroMediaIdInput)),
            paths.heroFolder,
            paths.heroFile,
            heroMediaIdInput,
            `${title} hero`
          )
        : { id: highlight.id, url: highlight.url };

    const routeMap =
      routeMapUrl || routeMapMediaIdInput
        ? await settleTravelAsset(
            routeMapUrl || (await mediaUrlForId(routeMapMediaIdInput)),
            paths.mapFolder,
            paths.mapFile,
            routeMapMediaIdInput,
            `${title} route map`
          )
        : { id: hero.id, url: hero.url };

    const places = routePlacesPreview;

    await db
      .insert(trips)
      .values({
        id,
        country: title,
        dateLabel,
        summary,
        heroMediaId: hero.id,
        statDays: days,
        statRegions: places.length,
        statPhotos: 0,
        statCountries: 1,
        routeMapMediaId: routeMap.id,
        routeNote,
        gearMediaId: hero.id,
        reflectionExcerpt: summary,
        reflectionSlug: `${id}-reflection`,
      })
      .onConflictDoUpdate({
        target: trips.id,
        set: {
          country: title,
          dateLabel,
          summary,
          heroMediaId: hero.id,
          statDays: days,
          statRegions: places.length,
          routeMapMediaId: routeMap.id,
          routeNote,
          gearMediaId: hero.id,
          reflectionExcerpt: summary,
          reflectionSlug: `${id}-reflection`,
        },
      });

    await db.delete(tripRouteStops).where(eq(tripRouteStops.tripId, id));
    await db.delete(tripTimeline).where(eq(tripTimeline.tripId, id));
    await db.delete(tripMoments).where(eq(tripMoments.tripId, id));

    if (places.length > 0) {
      await db.insert(tripRouteStops).values(
        places.map((place) => ({
          tripId: id,
          name: place.name,
          coordX: 0,
          coordY: 0,
          sortOrder: place.sortOrder,
        }))
      );
    }

    for (let index = 0; index < 4; index++) {
      const momentTitle = String(formData.get(`momentTitle_${index}`) ?? "").trim();
      const url = stripUrlQuery(String(formData.get(`momentUrl_${index}`) ?? "").trim());
      const mediaIdInput = String(formData.get(`momentMediaId_${index}`) ?? "").trim();
      if (!momentTitle || (!url && !mediaIdInput)) continue;
      const source = url || (await mediaUrlForId(mediaIdInput));
      const moment = await settleTravelAsset(
        source,
        paths.momentsFolder,
        `moment-${index + 1}.webp`,
        mediaIdInput,
        momentTitle
      );
      await db.insert(tripMoments).values({
        tripId: id,
        title: momentTitle,
        photoCount: 0,
        imageMediaId: moment.id,
        sortOrder: index,
      });
    }

    const galleryUploads = parseGalleryUploads(String(formData.get("galleryUploads") ?? ""));
    await attachTripGalleryUploads(id, galleryUploads);

    revalidateTravel(id);
    redirect(`/admin/travel/${id}?saved=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not save place.";
    return { error: message };
  }
}

async function mediaUrlForId(id: string): Promise<string> {
  if (!id) return "";
  const [row] = await db
    .select({ url: mediaAssets.url })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return row?.url ?? "";
}

function revalidateTravel(id: string) {
  revalidatePath("/travel");
  revalidatePath(`/travel/${id}`);
  revalidatePath("/gallery/travel");
  revalidatePath("/admin/travel");
  revalidatePath(`/admin/travel/${id}`);
}

export async function deleteDestination(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.delete(destinations).where(eq(destinations.id, id));
  revalidatePath("/travel");
  revalidatePath("/admin/travel");
  redirect("/admin/travel");
}

/** Bust stale ISR for public travel pages (R2 long-lived cache). */
export async function refreshTravelPublicPages() {
  await requireAdminAction();
  revalidatePath("/travel");
  revalidatePath("/gallery/travel");
  const rows = await db.select({ id: destinations.id }).from(destinations);
  for (const row of rows) {
    revalidatePath(`/travel/${row.id}`);
  }
  redirect("/admin/travel?refreshed=1");
}
