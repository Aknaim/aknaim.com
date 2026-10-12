/**
 * Local bootstrap seed only.
 *
 * - Refuses Neon / production DATABASE_URL (no override).
 * - Never deletes climbing sends, sessions, projects, or climbing gallery.
 * - Never overwrites destination dates / counts / images once a row exists.
 * - Recipes & interest settings: insert-only (skip if already present).
 */
import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  allRecipes,
  cookingGearItems,
} from "../data/recipes";
import {
  climbingGallerySeedItems,
  climbingGearItems,
  climbingProjects,
  progressionTimeline,
  recentSends,
} from "../climbingData";
import {
  destinations,
  legacyTravelGallerySeedIds,
  omanTripMomentSeeds,
  omanTripRouteMapSrc,
  tripRouteMapSrcById,
  travelGallerySeedItems,
  travelStats as travelStatsData,
} from "../travelData";
import { siteData } from "../data";
import * as schema from "./schema";

function cleanDbUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function assertLocalOnlyDatabaseUrl(url: string) {
  if (/neon\.tech|neon\.database/i.test(url)) {
    throw new Error(
      "db:seed refuses Neon/production. Keep DATABASE_URL on local Docker only. " +
        "Use admin UI or a surgical SQL update for prod — never seed Neon."
    );
  }
  const neon = cleanDbUrl(process.env.DATABASE_URL_NEON_PRODUCTION);
  if (neon && url === neon) {
    throw new Error(
      "db:seed refuses DATABASE_URL_NEON_PRODUCTION. Point DATABASE_URL at local Docker."
    );
  }
}

async function ensureMedia(
  db: ReturnType<typeof drizzle<typeof schema>>,
  url: string,
  alt?: string,
  options?: { mediaType?: "image" | "video"; posterUrl?: string; durationLabel?: string }
) {
  const mediaType = options?.mediaType ?? "image";
  const existing = await db
    .select()
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.url, url))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.mediaAssets)
      .set({
        alt: alt ?? existing[0].alt,
        mediaType,
        posterUrl: options?.posterUrl ?? existing[0].posterUrl,
        durationLabel: options?.durationLabel ?? existing[0].durationLabel,
      })
      .where(eq(schema.mediaAssets.id, existing[0].id));
    return existing[0].id;
  }

  const [row] = await db
    .insert(schema.mediaAssets)
    .values({
      url,
      alt: alt ?? null,
      mediaType,
      posterUrl: options?.posterUrl ?? null,
      durationLabel: options?.durationLabel ?? null,
    })
    .returning({ id: schema.mediaAssets.id });

  return row.id;
}

async function seed() {
  const url = cleanDbUrl(process.env.DATABASE_URL);
  if (!url) throw new Error("DATABASE_URL is not set");
  assertLocalOnlyDatabaseUrl(url);

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding media + recipes (insert-only)…");

  for (const recipe of allRecipes) {
    const existingRecipe = await db
      .select({ slug: schema.recipes.slug })
      .from(schema.recipes)
      .where(eq(schema.recipes.slug, recipe.slug))
      .limit(1);
    if (existingRecipe[0]) continue;

    const imageMediaId = await ensureMedia(db, recipe.imageSrc, recipe.title);
    const heroMediaId = await ensureMedia(db, recipe.heroImage, recipe.title);

    await db.insert(schema.recipes).values({
      slug: recipe.slug,
      title: recipe.title,
      dateLabel: recipe.date,
      dateTaken: recipe.dateTaken,
      imageMediaId,
      heroMediaId,
      categoryId: recipe.categoryId,
      categoryLabel: recipe.category,
      cuisine: recipe.cuisine,
      description: recipe.description,
      notes: recipe.notes,
      servings: recipe.quickStats.servings,
      totalTime: recipe.quickStats.totalTime,
      difficulty: recipe.quickStats.difficulty,
      ovenTemp: recipe.quickStats.ovenTemp ?? null,
      infoCuisine: recipe.info.cuisine,
      infoCourse: recipe.info.course,
      infoMethod: recipe.info.method ?? "",
      infoDiet: recipe.info.diet ?? "",
      keywords: recipe.info.keywords,
      calories: recipe.nutrition.calories ?? 0,
      protein: recipe.nutrition.protein ?? "",
      carbs: recipe.nutrition.carbs ?? "",
      fat: recipe.nutrition.fat ?? "",
      published: true,
      updatedAt: new Date(),
    });

    for (const [groupIndex, group] of recipe.ingredients.entries()) {
      const [groupRow] = await db
        .insert(schema.ingredientGroups)
        .values({
          recipeSlug: recipe.slug,
          label: group.label,
          sortOrder: groupIndex,
        })
        .returning({ id: schema.ingredientGroups.id });

      if (group.items.length > 0) {
        await db.insert(schema.ingredients).values(
          group.items.map((item, itemIndex) => ({
            groupId: groupRow.id,
            quantity: item.amount,
            quantityMetric: "",
            unit: item.unit,
            note: item.note ?? "",
            name: item.name,
            sortOrder: itemIndex,
          }))
        );
      }
    }

    for (const step of recipe.steps) {
      const stepMediaId = step.imageSrc
        ? await ensureMedia(db, step.imageSrc, step.title)
        : null;
      await db.insert(schema.recipeSteps).values({
        recipeSlug: recipe.slug,
        stepNumber: step.number,
        title: step.title,
        description: step.description,
        imageMediaId: stepMediaId,
      });
    }

    for (const [index, image] of recipe.finalResultImages.entries()) {
      const mediaId = await ensureMedia(db, image.src, image.alt);
      await db.insert(schema.recipeFinalImages).values({
        recipeSlug: recipe.slug,
        mediaAssetId: mediaId,
        alt: image.alt,
        sortOrder: index,
      });
    }

    await db
      .insert(schema.galleryItems)
      .values({
        id: recipe.slug,
        interest: "cooking",
        mediaAssetId: heroMediaId,
        title: recipe.title,
        dateTaken: recipe.dateTaken,
        filters: { category: recipe.categoryId, cuisine: recipe.cuisine },
        recipeSlug: recipe.slug,
        sortOrder: 0,
        published: true,
      })
      .onConflictDoNothing({ target: schema.galleryItems.id });
  }

  console.log("Seeding gear…");
  const existingGear = await db
    .select({ id: schema.gearItems.id })
    .from(schema.gearItems)
    .limit(1);
  if (!existingGear[0]) {
    await db.insert(schema.gearItems).values([
      ...cookingGearItems.map((item, index) => ({
        interest: "cooking" as const,
        title: item.title,
        description: item.description,
        sortOrder: index,
      })),
      ...climbingGearItems.map((item, index) => ({
        interest: "climbing" as const,
        title: item.title,
        description: item.description,
        sortOrder: index,
      })),
    ]);
  }

  console.log("Seeding climbing (never deletes existing climbs)…");
  const locations: Array<{
    id: string;
    name: string;
    kind: "gym" | "outdoor";
  }> = [
    { id: "climbers-rock", name: "Climbers Rock", kind: "gym" },
    { id: "gravity", name: "Gravity", kind: "gym" },
    { id: "the-hub", name: "The Hub", kind: "gym" },
    { id: "outdoor", name: "Outdoor", kind: "outdoor" },
  ];
  for (const location of locations) {
    await db
      .insert(schema.climbingLocations)
      .values(location)
      .onConflictDoNothing({ target: schema.climbingLocations.id });
  }

  for (const [index, project] of climbingProjects.entries()) {
    const imageMediaId = await ensureMedia(db, project.imageSrc, project.name);
    await db
      .insert(schema.climbingProjects)
      .values({
        id: project.id,
        grade: project.grade,
        name: project.name,
        locationId: project.locationId,
        type: project.type,
        status: project.status,
        imageMediaId,
        sortOrder: index,
      })
      .onConflictDoNothing({ target: schema.climbingProjects.id });
  }

  for (const [index, send] of recentSends.entries()) {
    const sessionId = `session-${send.sessionDate}-${send.locationId}`;
    await db
      .insert(schema.climbingSessions)
      .values({
        id: sessionId,
        sessionDate: send.sessionDate,
        locationId: send.locationId,
        notes: null,
      })
      .onConflictDoNothing({ target: schema.climbingSessions.id });

    const imageMediaId = await ensureMedia(db, send.imageSrc, send.routeName);
    await db
      .insert(schema.climbingSends)
      .values({
        id: send.id,
        slug: send.slug,
        grade: send.grade,
        routeName: send.routeName,
        locationId: send.locationId,
        type: send.type,
        color: send.color,
        result: send.result,
        sessionId,
        sendDateLabel: send.date,
        durationLabel: send.duration,
        imageMediaId,
        sortOrder: index,
      })
      .onConflictDoNothing({ target: schema.climbingSends.id });
  }

  const existingProgression = await db
    .select({ id: schema.climbingProgression.id })
    .from(schema.climbingProgression)
    .limit(1);
  if (!existingProgression[0] && progressionTimeline.length > 0) {
    await db.insert(schema.climbingProgression).values(
      progressionTimeline.map((item, index) => ({
        yearLabel: item.year,
        milestoneLabel: item.label,
        sortOrder: index,
      }))
    );
  }

  for (const [index, item] of climbingGallerySeedItems.entries()) {
    const mediaAssetId = await ensureMedia(db, item.src, item.alt, {
      mediaType: item.mediaType ?? "image",
      posterUrl: item.posterSrc,
      durationLabel: item.duration,
    });
    await db
      .insert(schema.galleryItems)
      .values({
        id: item.id,
        interest: "climbing",
        mediaAssetId,
        title: item.title ?? null,
        dateTaken: item.dateTaken,
        filters: item.filters,
        durationLabel: item.duration ?? null,
        sortOrder: index,
        published: true,
      })
      .onConflictDoNothing({ target: schema.galleryItems.id });
  }

  console.log("Seeding travel…");
  for (const [index, dest] of destinations.entries()) {
    const imageMediaId = await ensureMedia(db, dest.imageSrc, dest.title);
    await db
      .insert(schema.destinations)
      .values({
        id: dest.id,
        displayNumber: dest.number,
        title: dest.title,
        subtitle: dest.subtitle ?? null,
        photosCount: dest.photosCount,
        notesCount: dest.notesCount,
        dateLabel: dest.date,
        imageMediaId,
        mapX: dest.mapCoordinates.x,
        mapY: dest.mapCoordinates.y,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: schema.destinations.id,
        set: {
          // Admin owns dates, counts, and card images — seed only refreshes map chrome.
          displayNumber: dest.number,
          title: dest.title,
          subtitle: dest.subtitle ?? null,
          mapX: dest.mapCoordinates.x,
          mapY: dest.mapCoordinates.y,
          sortOrder: index,
        },
      });
  }

  // Attach canonical R2 route maps (clean “Route 1” maps) when missing / hero stand-in / old local JPG.
  const allTrips = await db
    .select({
      id: schema.trips.id,
      heroMediaId: schema.trips.heroMediaId,
      routeMapMediaId: schema.trips.routeMapMediaId,
    })
    .from(schema.trips);

  for (const trip of allTrips) {
    const canonicalMapUrl = tripRouteMapSrcById[trip.id];
    if (!canonicalMapUrl) continue;

    const [routeMapAsset] = await db
      .select({ url: schema.mediaAssets.url })
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.id, trip.routeMapMediaId))
      .limit(1);

    const routeNeedsFix =
      trip.routeMapMediaId === trip.heroMediaId ||
      !routeMapAsset ||
      routeMapAsset.url === omanTripRouteMapSrc ||
      routeMapAsset.url !== canonicalMapUrl;

    if (routeNeedsFix) {
      const routeMapMediaId = await ensureMedia(
        db,
        canonicalMapUrl,
        `${trip.id} route map`
      );
      await db
        .update(schema.trips)
        .set({ routeMapMediaId })
        .where(eq(schema.trips.id, trip.id));
      console.log(`  route map → ${trip.id}: ${canonicalMapUrl}`);
    }
  }

  // Oman trip moments only (do not touch hero/summary/admin fields).
  const omanTrip = allTrips.find((trip) => trip.id === "oman");
  if (omanTrip) {
    const existingMoments = await db
      .select({ id: schema.tripMoments.id })
      .from(schema.tripMoments)
      .where(eq(schema.tripMoments.tripId, "oman"))
      .limit(1);

    if (existingMoments.length === 0) {
      for (const [index, moment] of omanTripMomentSeeds.entries()) {
        const imageMediaId = await ensureMedia(db, moment.imageSrc, moment.title);
        await db.insert(schema.tripMoments).values({
          tripId: "oman",
          title: moment.title,
          photoCount: moment.photoCount,
          imageMediaId,
          sortOrder: index,
        });
      }
    }
  }

  await db
    .insert(schema.travelStats)
    .values({
      id: 1,
      places: travelStatsData.places,
      photosLabel: travelStatsData.photos,
      notesLabel: travelStatsData.notes,
      memoriesLabel: travelStatsData.memories,
    })
    .onConflictDoUpdate({
      target: schema.travelStats.id,
      set: {
        places: travelStatsData.places,
        photosLabel: travelStatsData.photos,
        notesLabel: travelStatsData.notes,
        memoriesLabel: travelStatsData.memories,
      },
    });

  // Drop legacy Oman stock gallery rows; keep real admin uploads.
  if (legacyTravelGallerySeedIds.length > 0) {
    await db
      .delete(schema.galleryItems)
      .where(inArray(schema.galleryItems.id, [...legacyTravelGallerySeedIds]));
  }

  for (const [index, item] of travelGallerySeedItems.entries()) {
    const mediaAssetId = await ensureMedia(db, item.src, item.alt);
    await db
      .insert(schema.galleryItems)
      .values({
        id: item.id,
        interest: "travel",
        mediaAssetId,
        title: item.title ?? null,
        dateTaken: item.dateTaken,
        filters: item.filters,
        sortOrder: index,
        published: true,
      })
      .onConflictDoUpdate({
        target: schema.galleryItems.id,
        set: {
          mediaAssetId,
          title: item.title ?? null,
          dateTaken: item.dateTaken,
          filters: item.filters,
          sortOrder: index,
          published: true,
        },
      });
  }

  console.log("Seeding interest settings…");
  for (const interest of siteData.interests) {
    // Insert-only — do not overwrite admin edits on re-seed.
    await db
      .insert(schema.interestSettings)
      .values({
        id: interest.id,
        status: interest.status,
        workbenchNote: interest.workbenchNote ?? null,
        lastActive: interest.lastActive ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoNothing({ target: schema.interestSettings.id });
  }

  console.log("Seed complete.");
  await client.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
