"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  galleryItems,
  ingredientGroups,
  ingredients,
  recipeFinalImages,
  recipeSteps,
  recipes,
} from "@/lib/db/schema";
import { ensureMediaAssetId } from "./media";
import { requireAdminAction } from "./require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createOrUpdateRecipe(formData: FormData) {
  await requireAdminAction();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  const dateLabel = String(formData.get("dateLabel") ?? "").trim();
  const dateTaken = String(formData.get("dateTaken") ?? "").trim();
  const imageSrc = String(formData.get("imageSrc") ?? "").trim();
  const heroImage = String(formData.get("heroImage") ?? imageSrc).trim();
  const categoryId = String(formData.get("categoryId") ?? "dinner");
  const categoryLabel = String(formData.get("categoryLabel") ?? "Dinner");
  const cuisine = String(formData.get("cuisine") ?? "italian");
  const description = String(formData.get("description") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const servings = Number(formData.get("servings") ?? 2);
  const totalTime = String(formData.get("totalTime") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "Medium");
  const ovenTemp = String(formData.get("ovenTemp") ?? "").trim() || null;
  const infoCuisine = String(formData.get("infoCuisine") ?? cuisine);
  const infoCourse = String(formData.get("infoCourse") ?? categoryLabel);
  const infoMethod = String(formData.get("infoMethod") ?? "");
  const infoDiet = String(formData.get("infoDiet") ?? "");
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const calories = Number(formData.get("calories") ?? 0);
  const protein = String(formData.get("protein") ?? "");
  const carbs = String(formData.get("carbs") ?? "");
  const fat = String(formData.get("fat") ?? "");
  const ingredientsJson = String(formData.get("ingredientsJson") ?? "[]");
  const stepsJson = String(formData.get("stepsJson") ?? "[]");

  if (!title || !slug || !dateTaken || !imageSrc || !description) {
    throw new Error("Missing required recipe fields");
  }

  const imageMediaId = await ensureMediaAssetId(imageSrc, title);
  const heroMediaId = await ensureMediaAssetId(heroImage, title);

  await db
    .insert(recipes)
    .values({
      slug,
      title,
      dateLabel: dateLabel || dateTaken,
      dateTaken,
      imageMediaId,
      heroMediaId,
      categoryId,
      categoryLabel,
      cuisine,
      description,
      notes,
      servings,
      totalTime: totalTime || "1h",
      difficulty,
      ovenTemp,
      infoCuisine,
      infoCourse,
      infoMethod,
      infoDiet,
      keywords,
      calories,
      protein,
      carbs,
      fat,
      published: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: recipes.slug,
      set: {
        title,
        dateLabel: dateLabel || dateTaken,
        dateTaken,
        imageMediaId,
        heroMediaId,
        categoryId,
        categoryLabel,
        cuisine,
        description,
        notes,
        servings,
        totalTime: totalTime || "1h",
        difficulty,
        ovenTemp,
        infoCuisine,
        infoCourse,
        infoMethod,
        infoDiet,
        keywords,
        calories,
        protein,
        carbs,
        fat,
        updatedAt: new Date(),
      },
    });

  await db.delete(ingredientGroups).where(eq(ingredientGroups.recipeSlug, slug));
  await db.delete(recipeSteps).where(eq(recipeSteps.recipeSlug, slug));

  const parsedIngredients = JSON.parse(ingredientsJson) as Array<{
    label: string;
    items: Array<{ quantity: string; quantityMetric: string; name: string }>;
  }>;

  for (const [groupIndex, group] of parsedIngredients.entries()) {
    const [groupRow] = await db
      .insert(ingredientGroups)
      .values({ recipeSlug: slug, label: group.label, sortOrder: groupIndex })
      .returning();

    if (group.items?.length) {
      await db.insert(ingredients).values(
        group.items.map((item, itemIndex) => ({
          groupId: groupRow.id,
          quantity: item.quantity,
          quantityMetric: item.quantityMetric,
          name: item.name,
          sortOrder: itemIndex,
        }))
      );
    }
  }

  const parsedSteps = JSON.parse(stepsJson) as Array<{
    number: number;
    title: string;
    description: string;
    imageSrc?: string;
  }>;

  for (const step of parsedSteps) {
    const imageMediaIdStep = step.imageSrc
      ? await ensureMediaAssetId(step.imageSrc, step.title)
      : null;
    await db.insert(recipeSteps).values({
      recipeSlug: slug,
      stepNumber: step.number,
      title: step.title,
      description: step.description,
      imageMediaId: imageMediaIdStep,
    });
  }

  await db
    .insert(galleryItems)
    .values({
      id: slug,
      interest: "cooking",
      mediaAssetId: heroMediaId,
      title,
      dateTaken,
      filters: { category: categoryId, cuisine },
      recipeSlug: slug,
      published: true,
    })
    .onConflictDoUpdate({
      target: galleryItems.id,
      set: {
        mediaAssetId: heroMediaId,
        title,
        dateTaken,
        filters: { category: categoryId, cuisine },
        recipeSlug: slug,
        published: true,
      },
    });

  revalidatePath("/cooking");
  revalidatePath(`/cooking/${slug}`);
  revalidatePath("/gallery/cooking");
  revalidatePath("/admin/recipes");
  redirect(`/admin/recipes/${slug}`);
}

export async function deleteRecipe(formData: FormData) {
  await requireAdminAction();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  await db.delete(galleryItems).where(eq(galleryItems.id, slug));
  await db.delete(recipeFinalImages).where(eq(recipeFinalImages.recipeSlug, slug));
  await db.delete(recipeSteps).where(eq(recipeSteps.recipeSlug, slug));
  await db.delete(ingredientGroups).where(eq(ingredientGroups.recipeSlug, slug));
  await db.delete(recipes).where(eq(recipes.slug, slug));

  revalidatePath("/cooking");
  revalidatePath("/gallery/cooking");
  revalidatePath("/admin/recipes");
  redirect("/admin/recipes");
}
