"use server";

import { eq, inArray } from "drizzle-orm";
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
import { revalidateTravelPublicPages } from "@/lib/cache/revalidate-public";
import { requireAdminAction } from "./require-admin";

export type TravelPlaceSaveState = { error: string } | null;

export type TravelGalleryAttachResult =
  | { ok: true; attached: number; skipped: number }
  | { ok: false; error: string };

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

type GalleryUploadRef = {
  url: string;
  mediaId: string;
  name: string;
  /** ISO date from EXIF / filename when available */
  dateTaken?: string;
};

function parseGalleryUploads(raw: string): GalleryUploadRef[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: GalleryUploadRef[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const url = typeof row.url === "string" ? row.url.trim() : "";
      const mediaId = typeof row.mediaId === "string" ? row.mediaId.trim() : "";
      const name = typeof row.name === "string" ? row.name.trim() : "photo";
      if (!url && !mediaId) continue;
      const ref: GalleryUploadRef = { url, mediaId, name };
      if (
        typeof row.dateTaken === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(row.dateTaken.trim())
      ) {
        ref.dateTaken = row.dateTaken.trim();
      }
      out.push(ref);
    }
    return out;
  } catch {
    return [];
  }
}

async function mediaIdForUrl(finalUrl: string): Promise<string | null> {
  const [owner] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.url, finalUrl))
    .limit(1);
  return owner?.id ?? null;
}

async function mediaIdExists(id: string): Promise<boolean> {
  if (!id) return false;
  const [row] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return Boolean(row);
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

  // Upload already wrote the canonical key; finalizeMediaUpload registered the row.
  if (alreadyCanonical) {
    const byUrl = await mediaIdForUrl(cleanUrl);
    if (byUrl) return { id: byUrl, url: cleanUrl };
    if (existingId && (await mediaIdExists(existingId))) {
      return { id: existingId, url: cleanUrl };
    }
    const id = await ensureMediaAssetId(cleanUrl, alt);
    return { id, url: cleanUrl };
  }

  let finalUrl = cleanUrl;

  if (cleanUrl.startsWith("/media/")) {
    const { relocateLocalMediaUrl } = await mediaStorage();
    finalUrl = await relocateLocalMediaUrl(cleanUrl, folder, fileName);
  } else if (cleanUrl.startsWith("/images/")) {
    finalUrl = cleanUrl;
  } else {
    try {
      const { getR2PublicBaseUrl, relocateR2PublicUrl } = await import("@/lib/media/r2");
      if (cleanUrl.startsWith(`${getR2PublicBaseUrl()}/`)) {
        finalUrl = await relocateR2PublicUrl(cleanUrl, folder, fileName);
      }
    } catch {
      finalUrl = cleanUrl;
    }
  }

  const ownerId = await mediaIdForUrl(finalUrl);
  if (ownerId) {
    return { id: ownerId, url: finalUrl };
  }

  if (existingId && (await mediaIdExists(existingId))) {
    if (finalUrl !== cleanUrl) {
      try {
        await db
          .update(mediaAssets)
          .set({ url: finalUrl, alt })
          .where(eq(mediaAssets.id, existingId));
      } catch {
        const reused = await mediaIdForUrl(finalUrl);
        if (reused) return { id: reused, url: finalUrl };
        throw new Error(`Could not claim media URL ${finalUrl}`);
      }
    }
    return { id: existingId, url: finalUrl };
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

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const GALLERY_CHUNK = 5;

/**
 * Attach already-uploaded gallery files. Prefers the mediaId from finalize —
 * no per-photo settle/SELECT storm (that was killing Neon/Workers on big dumps).
 */
async function attachTripGalleryUploads(
  tripId: string,
  uploads: GalleryUploadRef[]
): Promise<{ attached: number; skipped: number }> {
  if (uploads.length === 0) return { attached: 0, skipped: 0 };

  const existing = await db
    .select({ id: galleryItems.id, sortOrder: galleryItems.sortOrder })
    .from(galleryItems)
    .where(eq(galleryItems.interest, "travel"));
  const existingIds = new Set(existing.map((row) => row.id));
  const existingSort = new Map(existing.map((row) => [row.id, row.sortOrder]));
  let sortOrder = existing.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1;

  type PendingRow = {
    uploadName: string;
    id: string;
    mediaAssetId: string;
    title: string;
    dateTaken: string;
    sortOrder: number;
  };

  const pending: PendingRow[] = [];
  let skipped = 0;

  for (const upload of uploads) {
    const stem = upload.name.replace(/\.[^.]+$/, "");
    const base = slugify(stem) || "photo";
    const id = `travel-${tripId}-${base}`;
    const fromExif =
      upload.dateTaken && /^\d{4}-\d{2}-\d{2}$/.test(upload.dateTaken)
        ? upload.dateTaken
        : null;

    // Already attached: only re-process when we have a fresh EXIF date to write back.
    if (existingIds.has(id) && !fromExif) {
      skipped += 1;
      continue;
    }

    let mediaAssetId = upload.mediaId.trim();
    if (!mediaAssetId) {
      // Rare: older upload payload without id — settle once.
      const paths = tripMediaPaths(tripId);
      const settled = await settleTravelAsset(
        upload.url,
        paths.galleryFolder,
        `${base}.webp`,
        "",
        upload.name
      );
      mediaAssetId = settled.id;
    }

    const isExisting = existingIds.has(id);
    pending.push({
      uploadName: upload.name,
      id,
      mediaAssetId,
      title: stem,
      dateTaken: fromExif ?? dateTakenFromFilename(upload.name),
      sortOrder: isExisting ? (existingSort.get(id) ?? sortOrder) : sortOrder,
    });
    if (!isExisting) {
      existingIds.add(id);
      sortOrder += 1;
    }
  }

  if (pending.length === 0) return { attached: 0, skipped };

  // One lookup for the whole dump — drop rows whose media id vanished.
  const mediaIds = [...new Set(pending.map((row) => row.mediaAssetId))];
  const present = new Set<string>();
  for (let i = 0; i < mediaIds.length; i += 40) {
    const slice = mediaIds.slice(i, i + 40);
    const rows = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(inArray(mediaAssets.id, slice));
    for (const row of rows) present.add(row.id);
  }

  const valid = pending.filter((row) => present.has(row.mediaAssetId));
  const missingMedia = pending.filter((row) => !present.has(row.mediaAssetId));
  const failures: string[] = missingMedia.map(
    (row) => `${row.uploadName}: media row missing (re-upload)`
  );

  let attached = 0;
  for (let i = 0; i < valid.length; i += GALLERY_CHUNK) {
    const chunk = valid.slice(i, i + GALLERY_CHUNK);

    for (const row of chunk) {
      try {
        await db
          .insert(galleryItems)
          .values({
            id: row.id,
            interest: "travel",
            mediaAssetId: row.mediaAssetId,
            title: row.title,
            dateTaken: row.dateTaken,
            filters: { trip: tripId },
            sortOrder: row.sortOrder,
            published: true,
          })
          .onConflictDoUpdate({
            target: galleryItems.id,
            set: {
              mediaAssetId: row.mediaAssetId,
              title: row.title,
              dateTaken: row.dateTaken,
              filters: { trip: tripId },
              published: true,
            },
          });
        attached += 1;
      } catch {
        await sleep(500);
        try {
          await db
            .insert(galleryItems)
            .values({
              id: row.id,
              interest: "travel",
              mediaAssetId: row.mediaAssetId,
              title: row.title,
              dateTaken: row.dateTaken,
              filters: { trip: tripId },
              sortOrder: row.sortOrder,
              published: true,
            })
            .onConflictDoUpdate({
              target: galleryItems.id,
              set: {
                mediaAssetId: row.mediaAssetId,
                title: row.title,
                dateTaken: row.dateTaken,
                filters: { trip: tripId },
                published: true,
              },
            });
          attached += 1;
        } catch (retryError) {
          const detail =
            retryError instanceof Error ? retryError.message : "unknown error";
          failures.push(`${row.uploadName}: ${detail}`);
        }
      }
    }

    if (i + GALLERY_CHUNK < valid.length) {
      await sleep(200);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Gallery attach failed for ${failures.length} photo(s). Place details were saved — keep this page open and use “Attach pending gallery” or save again.\n${failures.slice(0, 5).join("\n")}`
    );
  }

  return { attached, skipped };
}

/**
 * Attach a small batch of already-uploaded gallery photos (client-driven).
 * Prefer this over dumping 50+ attaches inside Save place.
 */
export async function attachTravelGalleryBatch(input: {
  tripId: string;
  uploads: GalleryUploadRef[];
}): Promise<TravelGalleryAttachResult> {
  try {
    await requireAdminAction();
    const tripId = slugify(input.tripId);
    if (!tripId) return { ok: false, error: "Missing trip id." };
    if (!Array.isArray(input.uploads) || input.uploads.length === 0) {
      return { ok: true, attached: 0, skipped: 0 };
    }
    // Cap each call so Workers stay under CPU/DB limits.
    const batch = input.uploads.slice(0, GALLERY_CHUNK);
    const result = await attachTripGalleryUploads(tripId, batch);
    revalidatePath(`/travel/${tripId}`);
    revalidatePath("/gallery/travel");
    revalidatePath(`/admin/travel/${tripId}`);
    return { ok: true, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gallery attach failed.";
    return { ok: false, error: message };
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

    const galleryUploadsPreview = parseGalleryUploads(
      String(formData.get("galleryUploads") ?? "")
    );

    const hasDetailExtras =
      Boolean(heroUrl || heroMediaIdInput) ||
      Boolean(routeMapUrl || routeMapMediaIdInput) ||
      Boolean(routeNote) ||
      routePlacesPreview.length > 0 ||
      days > 0 ||
      galleryUploadsPreview.length > 0 ||
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
    // Leftovers only — preferred path attaches during multi-upload in small batches.
    if (galleryUploads.length > 0) {
      try {
        await attachTripGalleryUploads(id, galleryUploads);
      } catch (galleryError) {
        revalidateTravel(id);
        const detail =
          galleryError instanceof Error ? galleryError.message : "Gallery attach failed.";
        return {
          error: `${detail}\nPlace details were saved. Open this place again and use Retry attach on the remaining photos.`,
        };
      }
    }

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
  await revalidateTravelPublicPages();
  redirect("/admin/travel?refreshed=1");
}
