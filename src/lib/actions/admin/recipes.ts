"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatMonthYear } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  galleryItems,
  ingredientGroups,
  ingredients,
  recipeFinalImages,
  recipeSteps,
  recipes,
} from "@/lib/db/schema";
import {
  categoryLabel,
  cuisineLabel,
  formatIngredientQty,
  type IngredientUnitId,
} from "@/lib/recipe/units";
import { ensureMediaAssetId } from "./ensure-media-asset";
import { requireAdminAction } from "./require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseIngredientGroups(formData: FormData) {
  const groupCount = Number(formData.get("ingredientGroupCount") ?? 0);
  const groups: Array<{
    label: string;
    items: Array<{
      amount: string;
      unit: IngredientUnitId;
      name: string;
      note: string;
    }>;
  }> = [];

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const label = String(formData.get(`ingredientGroupLabel_${groupIndex}`) ?? "").trim();
    const itemCount = Number(formData.get(`ingredientItemCount_${groupIndex}`) ?? 0);
    const items: Array<{
      amount: string;
      unit: IngredientUnitId;
      name: string;
      note: string;
    }> = [];

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
      const name = String(
        formData.get(`ingredientName_${groupIndex}_${itemIndex}`) ?? ""
      ).trim();
      if (!name) continue;
      items.push({
        amount: String(
          formData.get(`ingredientAmount_${groupIndex}_${itemIndex}`) ?? ""
        ).trim(),
        unit: String(
          formData.get(`ingredientUnit_${groupIndex}_${itemIndex}`) ?? "count"
        ) as IngredientUnitId,
        name,
        note: String(
          formData.get(`ingredientNote_${groupIndex}_${itemIndex}`) ?? ""
        ).trim(),
      });
    }

    if (!label && items.length === 0) continue;
    groups.push({ label: label || "Ingredients", items });
  }

  return groups;
}

function parseSteps(formData: FormData) {
  const stepCount = Number(formData.get("stepCount") ?? 0);
  const steps: Array<{
    number: number;
    title: string;
    description: string;
    imageSrc?: string;
  }> = [];

  for (let index = 0; index < stepCount; index += 1) {
    const title = String(formData.get(`stepTitle_${index}`) ?? "").trim();
    const description = String(formData.get(`stepDescription_${index}`) ?? "").trim();
    const imageSrc = String(formData.get(`stepImage_${index}`) ?? "").trim();
    if (!title && !description && !imageSrc) continue;
    steps.push({
      number: steps.length + 1,
      title: title || `Step ${steps.length + 1}`,
      description,
      imageSrc: imageSrc || undefined,
    });
  }

  return steps;
}

export async function createOrUpdateRecipe(formData: FormData) {
  await requireAdminAction();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);
  const dateTaken = String(formData.get("dateTaken") ?? "").trim();
  const imageSrc = String(formData.get("imageSrc") ?? "").trim();
  const heroImage = String(formData.get("heroImage") ?? imageSrc).trim() || imageSrc;
  const categoryId = String(formData.get("categoryId") ?? "dinner");
  const category = categoryLabel(categoryId);
  const cuisine = String(formData.get("cuisine") ?? "italian");
  const description = String(formData.get("description") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const servings = Number(formData.get("servings") ?? 2);
  const totalTime = String(formData.get("totalTime") ?? "").trim() || "1h";
  const difficulty = String(formData.get("difficulty") ?? "Medium");
  const ovenTemp = String(formData.get("ovenTemp") ?? "").trim() || null;
  const method = String(formData.get("method") ?? "").trim();
  const diet = String(formData.get("diet") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const caloriesRaw = String(formData.get("calories") ?? "").trim();
  const calories = caloriesRaw ? Number(caloriesRaw) : 0;
  const protein = String(formData.get("protein") ?? "").trim();
  const carbs = String(formData.get("carbs") ?? "").trim();
  const fat = String(formData.get("fat") ?? "").trim();

  if (!title || !slug || !dateTaken || !imageSrc || !description) {
    throw new Error("Missing required recipe fields");
  }

  const parsedIngredients = parseIngredientGroups(formData);
  const parsedSteps = parseSteps(formData);
  const dateLabel = formatMonthYear(dateTaken);

  const imageMediaId = await ensureMediaAssetId(imageSrc, title);
  const heroMediaId = await ensureMediaAssetId(heroImage, title);

  await db
    .insert(recipes)
    .values({
      slug,
      title,
      dateLabel,
      dateTaken,
      imageMediaId,
      heroMediaId,
      categoryId,
      categoryLabel: category,
      cuisine,
      description,
      notes,
      servings: Number.isFinite(servings) && servings > 0 ? servings : 2,
      totalTime,
      difficulty,
      ovenTemp,
      infoCuisine: cuisineLabel(cuisine),
      infoCourse: category,
      infoMethod: method,
      infoDiet: diet,
      keywords,
      calories: Number.isFinite(calories) ? calories : 0,
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
        dateLabel,
        dateTaken,
        imageMediaId,
        heroMediaId,
        categoryId,
        categoryLabel: category,
        cuisine,
        description,
        notes,
        servings: Number.isFinite(servings) && servings > 0 ? servings : 2,
        totalTime,
        difficulty,
        ovenTemp,
        infoCuisine: cuisineLabel(cuisine),
        infoCourse: category,
        infoMethod: method,
        infoDiet: diet,
        keywords,
        calories: Number.isFinite(calories) ? calories : 0,
        protein,
        carbs,
        fat,
        updatedAt: new Date(),
      },
    });

  await db.delete(ingredientGroups).where(eq(ingredientGroups.recipeSlug, slug));
  await db.delete(recipeSteps).where(eq(recipeSteps.recipeSlug, slug));

  for (const [groupIndex, group] of parsedIngredients.entries()) {
    const [groupRow] = await db
      .insert(ingredientGroups)
      .values({ recipeSlug: slug, label: group.label, sortOrder: groupIndex })
      .returning();

    if (group.items.length) {
      await db.insert(ingredients).values(
        group.items.map((item, itemIndex) => ({
          groupId: groupRow.id,
          quantity: item.amount,
          quantityMetric: formatIngredientQty(item.amount, item.unit, "metric"),
          unit: item.unit,
          note: item.note,
          name: item.name,
          sortOrder: itemIndex,
        }))
      );
    }
  }

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
