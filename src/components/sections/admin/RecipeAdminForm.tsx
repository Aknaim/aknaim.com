import { createOrUpdateRecipe } from "@/lib/actions/admin/recipes";
import type { RecipeDetail } from "@/lib/types/recipe";
import { AdminField } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

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
        <AdminField label="Title" name="title" defaultValue={recipe?.title} required />
        <AdminField
          label="Slug"
          name="slug"
          defaultValue={recipe?.slug}
          placeholder="auto-from-title"
        />
        <AdminField label="Date label" name="dateLabel" defaultValue={recipe?.date} />
        <AdminField
          label="Date taken (YYYY-MM-DD)"
          name="dateTaken"
          defaultValue={recipe?.dateTaken}
          required
        />
        <AdminField
          label="Category id"
          name="categoryId"
          defaultValue={recipe?.categoryId ?? "dinner"}
        />
        <AdminField
          label="Category label"
          name="categoryLabel"
          defaultValue={recipe?.category ?? "Dinner"}
        />
        <AdminField label="Cuisine id" name="cuisine" defaultValue={recipe?.cuisine ?? "italian"} />
        <AdminField
          label="Servings"
          name="servings"
          defaultValue={String(recipe?.quickStats.servings ?? 2)}
        />
        <AdminField
          label="Total time"
          name="totalTime"
          defaultValue={recipe?.quickStats.totalTime ?? "1h"}
        />
        <AdminField
          label="Difficulty"
          name="difficulty"
          defaultValue={recipe?.quickStats.difficulty ?? "Medium"}
        />
        <AdminField
          label="Oven temp"
          name="ovenTemp"
          defaultValue={recipe?.quickStats.ovenTemp ?? ""}
        />
        <AdminField
          label="Calories"
          name="calories"
          defaultValue={String(recipe?.nutrition.calories ?? 0)}
        />
        <AdminField label="Protein" name="protein" defaultValue={recipe?.nutrition.protein ?? ""} />
        <AdminField label="Carbs" name="carbs" defaultValue={recipe?.nutrition.carbs ?? ""} />
        <AdminField label="Fat" name="fat" defaultValue={recipe?.nutrition.fat ?? ""} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MediaUploadField
          name="imageSrc"
          label="Card image"
          folder="cooking"
          accept="image/*"
          defaultUrl={recipe?.imageSrc}
          required={!recipe}
        />
        <MediaUploadField
          name="heroImage"
          label="Hero image"
          folder="cooking"
          accept="image/*"
          defaultUrl={recipe?.heroImage}
        />
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
        <AdminField
          label="Info cuisine"
          name="infoCuisine"
          defaultValue={recipe?.info.cuisine ?? ""}
        />
        <AdminField label="Info course" name="infoCourse" defaultValue={recipe?.info.course ?? ""} />
        <AdminField label="Info method" name="infoMethod" defaultValue={recipe?.info.method ?? ""} />
        <AdminField label="Info diet" name="infoDiet" defaultValue={recipe?.info.diet ?? ""} />
        <AdminField
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
