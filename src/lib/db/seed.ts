import "dotenv/config";
import { eq, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  allRecipes,
  cookingGearItems,
} from "../data/recipes";
import { omanTripData } from "../data/trips/oman";
import {
  climbingGallerySeedItems,
  climbingGearItems,
  climbingProjects,
  progressionTimeline,
  recentSends,
} from "../climbingData";
import {
  destinations,
  travelGallerySeedItems,
  travelStats as travelStatsData,
} from "../travelData";
import { siteData } from "../data";
import * as schema from "./schema";

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
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding media + recipes…");

  // Keep DB in sync with the static seed list (empty = wipe legacy placeholders).
  const seedSlugs = allRecipes.map((recipe) => recipe.slug);
  if (seedSlugs.length === 0) {
    await db.delete(schema.recipes);
  } else {
    await db.delete(schema.recipes).where(notInArray(schema.recipes.slug, seedSlugs));
  }

  for (const recipe of allRecipes) {
    const imageMediaId = await ensureMedia(db, recipe.imageSrc, recipe.title);
    const heroMediaId = await ensureMedia(db, recipe.heroImage, recipe.title);

    await db
      .insert(schema.recipes)
      .values({
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
      })
      .onConflictDoUpdate({
        target: schema.recipes.slug,
        set: {
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
          updatedAt: new Date(),
        },
      });

    await db
      .delete(schema.ingredientGroups)
      .where(eq(schema.ingredientGroups.recipeSlug, recipe.slug));
    await db
      .delete(schema.recipeSteps)
      .where(eq(schema.recipeSteps.recipeSlug, recipe.slug));
    await db
      .delete(schema.recipeFinalImages)
      .where(eq(schema.recipeFinalImages.recipeSlug, recipe.slug));

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
      .onConflictDoUpdate({
        target: schema.galleryItems.id,
        set: {
          mediaAssetId: heroMediaId,
          title: recipe.title,
          dateTaken: recipe.dateTaken,
          filters: { category: recipe.categoryId, cuisine: recipe.cuisine },
          recipeSlug: recipe.slug,
          published: true,
        },
      });
  }

  console.log("Seeding gear…");
  await db.delete(schema.gearItems);
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

  console.log("Seeding climbing…");
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
      .onConflictDoUpdate({
        target: schema.climbingLocations.id,
        set: { name: location.name, kind: location.kind },
      });
  }
  // Replace climbing content so placeholder rows/media drop out of the site.
  await db.delete(schema.climbingSends);
  await db.delete(schema.climbingSessions);
  await db.delete(schema.climbingProjects);
  await db.delete(schema.galleryItems).where(eq(schema.galleryItems.interest, "climbing"));
  await db
    .delete(schema.climbingLocations)
    .where(
      notInArray(schema.climbingLocations.id, [
        "climbers-rock",
        "gravity",
        "the-hub",
        "outdoor",
      ])
    );

  for (const [index, project] of climbingProjects.entries()) {
    const imageMediaId = await ensureMedia(db, project.imageSrc, project.name);
    await db.insert(schema.climbingProjects).values({
      id: project.id,
      grade: project.grade,
      name: project.name,
      locationId: project.locationId,
      type: project.type,
      status: project.status,
      imageMediaId,
      sortOrder: index,
    });
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
      .onConflictDoUpdate({
        target: schema.climbingSessions.id,
        set: {
          sessionDate: send.sessionDate,
          locationId: send.locationId,
        },
      });

    const imageMediaId = await ensureMedia(db, send.imageSrc, send.routeName);
    await db.insert(schema.climbingSends).values({
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
    });
  }

  await db.delete(schema.climbingProgression);
  await db.insert(schema.climbingProgression).values(
    progressionTimeline.map((item, index) => ({
      yearLabel: item.year,
      milestoneLabel: item.label,
      sortOrder: index,
    }))
  );

  for (const [index, item] of climbingGallerySeedItems.entries()) {
    const mediaAssetId = await ensureMedia(db, item.src, item.alt, {
      mediaType: item.mediaType ?? "image",
      posterUrl: item.posterSrc,
      durationLabel: item.duration,
    });
    await db.insert(schema.galleryItems).values({
      id: item.id,
      interest: "climbing",
      mediaAssetId,
      title: item.title ?? null,
      dateTaken: item.dateTaken,
      filters: item.filters,
      durationLabel: item.duration ?? null,
      sortOrder: index,
      published: true,
    });
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
        },
      });
  }

  const trip = omanTripData;
  const heroMediaId = await ensureMedia(db, trip.heroImage, trip.country);
  const routeMapMediaId = await ensureMedia(db, trip.route.mapImage, "Route map");
  const gearMediaId = await ensureMedia(db, trip.gearImage, "Gear");

  await db
    .insert(schema.trips)
    .values({
      id: trip.id,
      country: trip.country,
      dateLabel: trip.date,
      summary: trip.summary,
      heroMediaId,
      statDays: trip.stats.days,
      statRegions: trip.stats.stops,
      statPhotos: trip.stats.photos,
      statCountries: 1,
      routeMapMediaId,
      routeNote: trip.route.note,
      gearMediaId,
      reflectionExcerpt: trip.reflection.excerpt,
      reflectionSlug: trip.reflection.slug,
    })
    .onConflictDoUpdate({
      target: schema.trips.id,
      set: {
        country: trip.country,
        dateLabel: trip.date,
        summary: trip.summary,
        heroMediaId,
        statDays: trip.stats.days,
        statRegions: trip.stats.stops,
        statPhotos: trip.stats.photos,
        statCountries: 1,
        routeMapMediaId,
        routeNote: trip.route.note,
        gearMediaId,
        reflectionExcerpt: trip.reflection.excerpt,
        reflectionSlug: trip.reflection.slug,
      },
    });

  await db.delete(schema.tripRouteStops).where(eq(schema.tripRouteStops.tripId, trip.id));
  await db.delete(schema.tripTimeline).where(eq(schema.tripTimeline.tripId, trip.id));
  await db.delete(schema.tripMoments).where(eq(schema.tripMoments.tripId, trip.id));
  await db.delete(schema.tripFieldNotes).where(eq(schema.tripFieldNotes.tripId, trip.id));
  await db
    .delete(schema.tripFavoritePlaces)
    .where(eq(schema.tripFavoritePlaces.tripId, trip.id));

  if (trip.route.stops.length > 0) {
    await db.insert(schema.tripRouteStops).values(
      trip.route.stops.map((stop, index) => ({
        tripId: trip.id,
        name: stop.name,
        coordX: stop.coordinates.x,
        coordY: stop.coordinates.y,
        sortOrder: index,
      }))
    );
  }
  for (const [index, moment] of trip.moments.entries()) {
    const imageMediaId = await ensureMedia(db, moment.imageSrc, moment.title);
    await db.insert(schema.tripMoments).values({
      tripId: trip.id,
      title: moment.title,
      photoCount: moment.photoCount,
      imageMediaId,
      sortOrder: index,
    });
  }
  await db.insert(schema.tripFieldNotes).values(
    trip.fieldNotes.map((note, index) => ({
      tripId: trip.id,
      noteText: note,
      sortOrder: index,
    }))
  );
  for (const [index, place] of trip.favoritePlaces.entries()) {
    const imageMediaId = await ensureMedia(db, place.imageSrc, place.title);
    await db.insert(schema.tripFavoritePlaces).values({
      tripId: trip.id,
      title: place.title,
      location: place.location,
      description: place.description,
      imageMediaId,
      sortOrder: index,
    });
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
