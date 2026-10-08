"use client";

import { useMemo, useState } from "react";
import { createOrUpdateRecipe } from "@/lib/actions/admin/recipes";
import { toInputDate } from "@/lib/dates";
import { RECIPE_CUISINE_OPTIONS } from "@/lib/recipe/cuisines";
import {
  INGREDIENT_UNITS,
  type IngredientUnitId,
} from "@/lib/recipe/units";
import type {
  IngredientGroup,
  RecipeCategoryId,
  RecipeDetail,
  RecipeStep,
} from "@/lib/types/recipe";
import { AdminDateField, AdminField, AdminSelect, AdminTextarea } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

interface RecipeAdminFormProps {
  recipe?: RecipeDetail;
}

type EditableItem = {
  key: string;
  amount: string;
  unit: IngredientUnitId;
  name: string;
  note: string;
};
type EditableGroup = { key: string; label: string; items: EditableItem[] };
type EditableStep = {
  key: string;
  title: string;
  description: string;
  imageSrc: string;
};

let rowKey = 0;
function nextKey(prefix: string) {
  rowKey += 1;
  return `${prefix}-${rowKey}`;
}

const CATEGORY_OPTIONS: Array<{ id: RecipeCategoryId; label: string }> = [
  { id: "dinner", label: "Dinner" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dessert", label: "Dessert" },
  { id: "baking", label: "Baking" },
  { id: "snacks", label: "Snacks" },
];

const CUISINE_OPTIONS = RECIPE_CUISINE_OPTIONS;

const DIFFICULTY_OPTIONS = [
  { id: "Easy", label: "Easy" },
  { id: "Medium", label: "Medium" },
  { id: "Hard", label: "Hard" },
];

const UNIT_OPTIONS = INGREDIENT_UNITS.map((unit) => ({
  id: unit.id,
  label: unit.label,
}));

function emptyItem(): EditableItem {
  return {
    key: nextKey("item"),
    amount: "",
    unit: "count",
    name: "",
    note: "",
  };
}

function emptyGroup(): EditableGroup {
  return { key: nextKey("group"), label: "Ingredients", items: [emptyItem()] };
}

function emptyStep(): EditableStep {
  return { key: nextKey("step"), title: "", description: "", imageSrc: "" };
}

function toEditableGroups(groups: IngredientGroup[] | undefined): EditableGroup[] {
  if (!groups?.length) return [emptyGroup()];
  return groups.map((group) => ({
    key: nextKey("group"),
    label: group.label,
    items: group.items.length
      ? group.items.map((item) => ({
          key: nextKey("item"),
          amount: item.amount,
          unit: item.unit,
          name: item.name,
          note: item.note ?? "",
        }))
      : [emptyItem()],
  }));
}

function toEditableSteps(steps: RecipeStep[] | undefined): EditableStep[] {
  if (!steps?.length) return [emptyStep()];
  return steps.map((step) => ({
    key: nextKey("step"),
    title: step.title,
    description: step.description,
    imageSrc: step.imageSrc ?? "",
  }));
}

function fieldClassName() {
  return "w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent";
}

export function RecipeAdminForm({ recipe }: RecipeAdminFormProps) {
  const [groups, setGroups] = useState<EditableGroup[]>(() =>
    toEditableGroups(recipe?.ingredients)
  );
  const [steps, setSteps] = useState<EditableStep[]>(() => toEditableSteps(recipe?.steps));
  const [showNutrition, setShowNutrition] = useState(() => {
    const n = recipe?.nutrition;
    return Boolean(n?.calories || n?.protein || n?.carbs || n?.fat);
  });
  const [nutrition, setNutrition] = useState({
    calories: recipe?.nutrition.calories ? String(recipe.nutrition.calories) : "",
    protein: recipe?.nutrition.protein ?? "",
    carbs: recipe?.nutrition.carbs ?? "",
    fat: recipe?.nutrition.fat ?? "",
  });
  const [uploadsPending, setUploadsPending] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const mediaFolder = useMemo(
    () => `cooking/${recipe?.slug ?? "inbox"}`,
    [recipe?.slug]
  );

  function trackUploadPending(pending: boolean) {
    setUploadsPending((count) => Math.max(0, count + (pending ? 1 : -1)));
  }

  return (
    <form
      action={createOrUpdateRecipe}
      className="space-y-10"
      onSubmit={(event) => {
        if (uploadsPending > 0) {
          event.preventDefault();
          setFormError("Wait for uploads to finish before saving.");
          return;
        }
        setFormError(null);
      }}
    >
      {formError ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-red-400">
          {formError}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Recipe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField label="Title" name="title" defaultValue={recipe?.title} required />
          <AdminField
            label="Slug"
            name="slug"
            defaultValue={recipe?.slug}
            placeholder="auto-from-title"
          />
          <AdminDateField
            label="Date"
            name="dateTaken"
            required
            defaultValue={toInputDate(recipe?.dateTaken ?? "")}
            hint="Month/year is derived for cards."
          />
          <AdminSelect
            label="Category"
            name="categoryId"
            defaultValue={recipe?.categoryId ?? "dinner"}
            options={CATEGORY_OPTIONS}
          />
          <AdminSelect
            label="Cuisine"
            name="cuisine"
            defaultValue={recipe?.cuisine ?? "italian"}
            options={CUISINE_OPTIONS}
          />
          <AdminField
            label="Servings"
            name="servings"
            type="number"
            required
            defaultValue={String(recipe?.quickStats.servings ?? 2)}
            hint="Base yield — public page can scale ½× / 2× / 3×."
          />
          <AdminField
            label="Total time"
            name="totalTime"
            defaultValue={recipe?.quickStats.totalTime ?? ""}
            placeholder="45m"
          />
          <AdminSelect
            label="Difficulty"
            name="difficulty"
            defaultValue={recipe?.quickStats.difficulty ?? "Medium"}
            options={DIFFICULTY_OPTIONS}
          />
          <AdminField
            label="Oven temp (optional)"
            name="ovenTemp"
            defaultValue={recipe?.quickStats.ovenTemp ?? ""}
            placeholder="450°F"
          />
          <AdminField
            label="Method (optional)"
            name="method"
            defaultValue={recipe?.info.method ?? ""}
            placeholder="Stovetop"
          />
          <AdminField
            label="Diet (optional)"
            name="diet"
            defaultValue={recipe?.info.diet ?? ""}
            placeholder="Vegetarian"
          />
          <AdminField
            label="Keywords (optional)"
            name="keywords"
            defaultValue={recipe?.info.keywords.join(", ") ?? ""}
            placeholder="pasta, sage"
          />
        </div>
        <AdminTextarea
          label="Description"
          name="description"
          required
          rows={3}
          defaultValue={recipe?.description}
        />
        <AdminTextarea
          label="Cook notes (optional)"
          name="notes"
          rows={2}
          defaultValue={recipe?.notes}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Photos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MediaUploadField
            name="imageSrc"
            label="Card image"
            folder={mediaFolder}
            accept="image/*"
            defaultUrl={recipe?.imageSrc}
            required={!recipe}
            onPendingChange={trackUploadPending}
          />
          <MediaUploadField
            name="heroImage"
            label="Hero image (optional — defaults to card)"
            folder={mediaFolder}
            accept="image/*"
            defaultUrl={
              recipe?.heroImage &&
              recipe.heroImage.split("?")[0] !== recipe.imageSrc.split("?")[0]
                ? recipe.heroImage
                : ""
            }
            onPendingChange={trackUploadPending}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              Nutrition
            </h2>
            <p className="font-mono text-[9px] text-foreground-subtle mt-1">
              Optional. Hidden on the public page when empty.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNutrition((value) => !value)}
            className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
          >
            {showNutrition ? "Hide" : "Add nutrition"}
          </button>
        </div>
        {showNutrition ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                Calories
              </span>
              <input
                type="number"
                name="calories"
                value={nutrition.calories}
                onChange={(event) =>
                  setNutrition((current) => ({ ...current, calories: event.target.value }))
                }
                className={fieldClassName()}
              />
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                Protein
              </span>
              <input
                type="text"
                name="protein"
                value={nutrition.protein}
                placeholder="14g"
                onChange={(event) =>
                  setNutrition((current) => ({ ...current, protein: event.target.value }))
                }
                className={fieldClassName()}
              />
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                Carbs
              </span>
              <input
                type="text"
                name="carbs"
                value={nutrition.carbs}
                placeholder="40g"
                onChange={(event) =>
                  setNutrition((current) => ({ ...current, carbs: event.target.value }))
                }
                className={fieldClassName()}
              />
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                Fat
              </span>
              <input
                type="text"
                name="fat"
                value={nutrition.fat}
                placeholder="12g"
                onChange={(event) =>
                  setNutrition((current) => ({ ...current, fat: event.target.value }))
                }
                className={fieldClassName()}
              />
            </label>
          </div>
        ) : (
          <>
            <input type="hidden" name="calories" value={nutrition.calories} />
            <input type="hidden" name="protein" value={nutrition.protein} />
            <input type="hidden" name="carbs" value={nutrition.carbs} />
            <input type="hidden" name="fat" value={nutrition.fat} />
          </>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              Ingredients
            </h2>
            <p className="font-mono text-[9px] text-foreground-subtle mt-1">
              Amount + unit. US/metric converts on the recipe page. Use count for “4 tomatoes”,
              and note for “finely chopped”.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGroups((current) => [...current, emptyGroup()])}
            className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
          >
            + Add group
          </button>
        </div>

        <input type="hidden" name="ingredientGroupCount" value={groups.length} />

        <div className="space-y-4">
          {groups.map((group, groupIndex) => (
            <div
              key={group.key}
              className="space-y-3 border border-[#141414] bg-[#0c0c0c] p-4"
            >
              <div className="flex items-end justify-between gap-3">
                <label className="block flex-1 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                    Group label
                  </span>
                  <input
                    type="text"
                    name={`ingredientGroupLabel_${groupIndex}`}
                    value={group.label}
                    required
                    onChange={(event) => {
                      const value = event.target.value;
                      setGroups((current) =>
                        current.map((entry, i) =>
                          i === groupIndex ? { ...entry, label: value } : entry
                        )
                      );
                    }}
                    className={fieldClassName()}
                  />
                </label>
                <button
                  type="button"
                  disabled={groups.length <= 1}
                  onClick={() =>
                    setGroups((current) => current.filter((_, i) => i !== groupIndex))
                  }
                  className="mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest text-foreground-subtle hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  Remove group
                </button>
              </div>

              <input
                type="hidden"
                name={`ingredientItemCount_${groupIndex}`}
                value={group.items.length}
              />

              <div className="space-y-2">
                <div className="hidden lg:grid lg:grid-cols-[5rem_8rem_1fr_1fr_auto] gap-2">
                  {["Amount", "Unit", "Ingredient", "Note / prep", ""].map((label) => (
                    <span
                      key={label || "actions"}
                      className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {group.items.map((item, itemIndex) => {
                  const needsAmount =
                    item.unit !== "to_taste" &&
                    item.unit !== "as_needed" &&
                    item.unit !== "handful" &&
                    item.unit !== "pinch";
                  return (
                    <div
                      key={item.key}
                      className="grid grid-cols-1 lg:grid-cols-[5rem_8rem_1fr_1fr_auto] gap-2 items-center"
                    >
                      <input
                        type="text"
                        name={`ingredientAmount_${groupIndex}_${itemIndex}`}
                        value={item.amount}
                        disabled={!needsAmount && item.unit !== "text"}
                        placeholder={item.unit === "text" ? "as written" : "2"}
                        onChange={(event) => {
                          const value = event.target.value;
                          setGroups((current) =>
                            current.map((entry, i) =>
                              i === groupIndex
                                ? {
                                    ...entry,
                                    items: entry.items.map((row, j) =>
                                      j === itemIndex ? { ...row, amount: value } : row
                                    ),
                                  }
                                : entry
                            )
                          );
                        }}
                        className={fieldClassName()}
                      />
                      <select
                        name={`ingredientUnit_${groupIndex}_${itemIndex}`}
                        value={item.unit}
                        onChange={(event) => {
                          const value = event.target.value as IngredientUnitId;
                          setGroups((current) =>
                            current.map((entry, i) =>
                              i === groupIndex
                                ? {
                                    ...entry,
                                    items: entry.items.map((row, j) =>
                                      j === itemIndex ? { ...row, unit: value } : row
                                    ),
                                  }
                                : entry
                            )
                          );
                        }}
                        className={fieldClassName()}
                      >
                        {UNIT_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name={`ingredientName_${groupIndex}_${itemIndex}`}
                        value={item.name}
                        required
                        placeholder="tomatoes"
                        onChange={(event) => {
                          const value = event.target.value;
                          setGroups((current) =>
                            current.map((entry, i) =>
                              i === groupIndex
                                ? {
                                    ...entry,
                                    items: entry.items.map((row, j) =>
                                      j === itemIndex ? { ...row, name: value } : row
                                    ),
                                  }
                                : entry
                            )
                          );
                        }}
                        className={fieldClassName()}
                      />
                      <input
                        type="text"
                        name={`ingredientNote_${groupIndex}_${itemIndex}`}
                        value={item.note}
                        placeholder="finely chopped"
                        onChange={(event) => {
                          const value = event.target.value;
                          setGroups((current) =>
                            current.map((entry, i) =>
                              i === groupIndex
                                ? {
                                    ...entry,
                                    items: entry.items.map((row, j) =>
                                      j === itemIndex ? { ...row, note: value } : row
                                    ),
                                  }
                                : entry
                            )
                          );
                        }}
                        className={fieldClassName()}
                      />
                      <button
                        type="button"
                        disabled={group.items.length <= 1}
                        onClick={() =>
                          setGroups((current) =>
                            current.map((entry, i) =>
                              i === groupIndex
                                ? {
                                    ...entry,
                                    items: entry.items.filter((_, j) => j !== itemIndex),
                                  }
                                : entry
                            )
                          )
                        }
                        className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setGroups((current) =>
                    current.map((entry, i) =>
                      i === groupIndex
                        ? { ...entry, items: [...entry.items, emptyItem()] }
                        : entry
                    )
                  )
                }
                className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
              >
                + Add ingredient
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              Steps
            </h2>
            <p className="font-mono text-[9px] text-foreground-subtle mt-1">
              Optional photo per step.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSteps((current) => [...current, emptyStep()])}
            className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
          >
            + Add step
          </button>
        </div>

        <input type="hidden" name="stepCount" value={steps.length} />

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="space-y-3 border border-[#141414] bg-[#0c0c0c] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                  Step {index + 1}
                </h3>
                <button
                  type="button"
                  disabled={steps.length <= 1}
                  onClick={() =>
                    setSteps((current) => current.filter((_, i) => i !== index))
                  }
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  Remove step
                </button>
              </div>
              <AdminField
                label="Title"
                name={`stepTitle_${index}`}
                defaultValue={step.title}
                placeholder="Brown the butter"
              />
              <AdminTextarea
                label="Description"
                name={`stepDescription_${index}`}
                rows={3}
                defaultValue={step.description}
              />
              <MediaUploadField
                name={`stepImage_${index}`}
                label="Step image (optional)"
                folder={`${mediaFolder}/steps`}
                accept="image/*"
                defaultUrl={step.imageSrc}
                onPendingChange={trackUploadPending}
              />
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={uploadsPending > 0}
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors disabled:opacity-50"
      >
        {uploadsPending > 0 ? "Uploading…" : "Save recipe"}
      </button>
    </form>
  );
}
