import { createOrUpdateRecipe } from "@/lib/actions/admin/recipes";
import type { RecipeDetail } from "@/lib/types/recipe";

interface RecipeAdminFormProps {
  recipe?: RecipeDetail;
}

export function RecipeAdminForm({ recipe }: RecipeAdminFormProps) {
  const defaultIngredients = recipe?.ingredients ?? [
    {
      label: "Ingredients",
      items: [{ quantity: "1", quantityMetric: "1", name: "" }],
    },
  ];
  const defaultSteps = recipe?.steps ?? [
    { number: 1, title: "", description: "", imageSrc: "" },
  ];

  return (
    <form action={createOrUpdateRecipe} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title" name="title" defaultValue={recipe?.title} required />
        <Field label="Slug" name="slug" defaultValue={recipe?.slug} placeholder="auto-from-title" />
        <Field label="Date label" name="dateLabel" defaultValue={recipe?.date} />
        <Field
          label="Date taken (YYYY-MM-DD)"
          name="dateTaken"
          defaultValue={recipe?.dateTaken}
          required
        />
        <Field label="Image URL" name="imageSrc" defaultValue={recipe?.imageSrc} required />
        <Field label="Hero image URL" name="heroImage" defaultValue={recipe?.heroImage} />
        <Field label="Category id" name="categoryId" defaultValue={recipe?.categoryId ?? "dinner"} />
        <Field label="Category label" name="categoryLabel" defaultValue={recipe?.category ?? "Dinner"} />
        <Field label="Cuisine id" name="cuisine" defaultValue={recipe?.cuisine ?? "italian"} />
        <Field label="Servings" name="servings" defaultValue={String(recipe?.quickStats.servings ?? 2)} />
        <Field label="Total time" name="totalTime" defaultValue={recipe?.quickStats.totalTime ?? "1h"} />
        <Field label="Difficulty" name="difficulty" defaultValue={recipe?.quickStats.difficulty ?? "Medium"} />
        <Field label="Oven temp" name="ovenTemp" defaultValue={recipe?.quickStats.ovenTemp ?? ""} />
        <Field label="Calories" name="calories" defaultValue={String(recipe?.nutrition.calories ?? 0)} />
        <Field label="Protein" name="protein" defaultValue={recipe?.nutrition.protein ?? ""} />
        <Field label="Carbs" name="carbs" defaultValue={recipe?.nutrition.carbs ?? ""} />
        <Field label="Fat" name="fat" defaultValue={recipe?.nutrition.fat ?? ""} />
      </div>

      <label className="block space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Description
        </span>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={recipe?.description}
          className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Notes
        </span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={recipe?.notes}
          className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Info cuisine" name="infoCuisine" defaultValue={recipe?.info.cuisine ?? ""} />
        <Field label="Info course" name="infoCourse" defaultValue={recipe?.info.course ?? ""} />
        <Field label="Info method" name="infoMethod" defaultValue={recipe?.info.method ?? ""} />
        <Field label="Info diet" name="infoDiet" defaultValue={recipe?.info.diet ?? ""} />
        <Field
          label="Keywords (comma-separated)"
          name="keywords"
          defaultValue={recipe?.info.keywords.join(", ") ?? ""}
        />
      </div>

      <label className="block space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Ingredients JSON
        </span>
        <textarea
          name="ingredientsJson"
          rows={10}
          defaultValue={JSON.stringify(defaultIngredients, null, 2)}
          className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent"
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Steps JSON
        </span>
        <textarea
          name="stepsJson"
          rows={10}
          defaultValue={JSON.stringify(defaultSteps, null, 2)}
          className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
      >
        Save recipe
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
      />
    </label>
  );
}
