"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { destinations, trips } from "@/lib/db/schema";
import { ensureMediaAssetId } from "./ensure-media-asset";
import { requireAdminAction } from "./require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createOrUpdateDestination(formData: FormData) {
  await requireAdminAction();

  const idInput = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const displayNumber = String(formData.get("displayNumber") ?? "").trim();
  const photosCount = Number(formData.get("photosCount") ?? 0);
  const notesCount = Number(formData.get("notesCount") ?? 0);
  const dateLabel = String(formData.get("dateLabel") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageMediaIdInput = String(formData.get("imageMediaId") ?? "").trim();
  const mapX = Number(formData.get("mapX") ?? 50);
  const mapY = Number(formData.get("mapY") ?? 50);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!title || !displayNumber || !dateLabel || (!imageUrl && !imageMediaIdInput)) {
    throw new Error("Title, number, date, and image are required.");
  }

  const id = idInput || slugify(title);
  const imageMediaId =
    imageMediaIdInput || (await ensureMediaAssetId(imageUrl, title));

  await db
    .insert(destinations)
    .values({
      id,
      displayNumber,
      title,
      subtitle,
      photosCount: Number.isFinite(photosCount) ? photosCount : 0,
      notesCount: Number.isFinite(notesCount) ? notesCount : 0,
      dateLabel,
      imageMediaId,
      mapX: Number.isFinite(mapX) ? mapX : 50,
      mapY: Number.isFinite(mapY) ? mapY : 50,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .onConflictDoUpdate({
      target: destinations.id,
      set: {
        displayNumber,
        title,
        subtitle,
        photosCount: Number.isFinite(photosCount) ? photosCount : 0,
        notesCount: Number.isFinite(notesCount) ? notesCount : 0,
        dateLabel,
        imageMediaId,
        mapX: Number.isFinite(mapX) ? mapX : 50,
        mapY: Number.isFinite(mapY) ? mapY : 50,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });

  revalidatePath("/travel");
  revalidatePath(`/travel/${id}`);
  revalidatePath("/admin/travel");
  redirect(`/admin/travel/${id}`);
}

export async function createOrUpdateTrip(formData: FormData) {
  await requireAdminAction();

  const id = String(formData.get("id") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const dateLabel = String(formData.get("dateLabel") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const heroUrl = String(formData.get("heroUrl") ?? "").trim();
  const heroMediaIdInput = String(formData.get("heroMediaId") ?? "").trim();
  const routeMapUrl = String(formData.get("routeMapUrl") ?? "").trim();
  const routeMapMediaIdInput = String(formData.get("routeMapMediaId") ?? "").trim();
  const gearUrl = String(formData.get("gearUrl") ?? "").trim();
  const gearMediaIdInput = String(formData.get("gearMediaId") ?? "").trim();
  const statDays = Number(formData.get("statDays") ?? 0);
  const statRegions = Number(formData.get("statRegions") ?? 0);
  const statPhotos = Number(formData.get("statPhotos") ?? 0);
  const statCountries = Number(formData.get("statCountries") ?? 1);
  const reflectionExcerpt = String(formData.get("reflectionExcerpt") ?? "").trim();
  const reflectionSlug = String(formData.get("reflectionSlug") ?? "").trim();

  if (!id || !country || !dateLabel || !summary) {
    throw new Error("Destination id, country, date, and summary are required.");
  }

  const heroMediaId =
    heroMediaIdInput || (await ensureMediaAssetId(heroUrl, `${country} hero`));
  const routeMapMediaId =
    routeMapMediaIdInput ||
    (await ensureMediaAssetId(routeMapUrl || heroUrl, `${country} route map`));
  const gearMediaId =
    gearMediaIdInput ||
    (await ensureMediaAssetId(gearUrl || heroUrl, `${country} gear`));

  await db
    .insert(trips)
    .values({
      id,
      country,
      dateLabel,
      summary,
      heroMediaId,
      statDays: Number.isFinite(statDays) ? statDays : 0,
      statRegions: Number.isFinite(statRegions) ? statRegions : 0,
      statPhotos: Number.isFinite(statPhotos) ? statPhotos : 0,
      statCountries: Number.isFinite(statCountries) ? statCountries : 1,
      routeMapMediaId,
      gearMediaId,
      reflectionExcerpt: reflectionExcerpt || summary,
      reflectionSlug: reflectionSlug || `${id}-reflection`,
    })
    .onConflictDoUpdate({
      target: trips.id,
      set: {
        country,
        dateLabel,
        summary,
        heroMediaId,
        statDays: Number.isFinite(statDays) ? statDays : 0,
        statRegions: Number.isFinite(statRegions) ? statRegions : 0,
        statPhotos: Number.isFinite(statPhotos) ? statPhotos : 0,
        statCountries: Number.isFinite(statCountries) ? statCountries : 1,
        routeMapMediaId,
        gearMediaId,
        reflectionExcerpt: reflectionExcerpt || summary,
        reflectionSlug: reflectionSlug || `${id}-reflection`,
      },
    });

  revalidatePath("/travel");
  revalidatePath(`/travel/${id}`);
  revalidatePath("/admin/travel");
  redirect(`/admin/travel/${id}`);
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
