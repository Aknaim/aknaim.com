/**
 * Upsert only recipes from `allRecipes` — skips travel/climbing seed side effects.
 * Usage: npx tsx scripts/seed-recipes-only.ts
 */
import "dotenv/config";
import { eq, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { allRecipes } from "../src/lib/data/recipes";
import * as schema from "../src/lib/db/schema";

async function ensureMedia(
  db: ReturnType<typeof drizzle<typeof schema>>,
  url: string,
  alt?: string
) {
  const existing = await db
    .select()
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.url, url))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(schema.mediaAssets)
    .values({ url, alt: alt ?? null, mediaType: "image" })
    .returning({ id: schema.mediaAssets.id });

  return row.id;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  const seedSlugs = allRecipes.map((recipe) => recipe.slug);
  if (seedSlugs.length === 0) {
    await db.delete(schema.recipes);
    console.log("No seed recipes — cleared recipes table.");
    await client.end();
    return;
  }

  await db.delete(schema.recipes).where(notInArray(schema.recipes.slug, seedSlugs));

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
      await db.insert(schema.recipeSteps).values({
        recipeSlug: recipe.slug,
        stepNumber: step.number,
        title: step.title,
        description: step.description,
        imageMediaId: null,
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

    console.log(`Upserted ${recipe.slug}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
