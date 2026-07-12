import { Heart } from "lucide-react";
import type { RecipeDetail } from "@/lib/types/recipe";

interface RecipeSidebarProps {
  recipe: RecipeDetail;
}

export function RecipeSidebar({ recipe }: RecipeSidebarProps) {
  const infoRows = [
    { label: "Cuisine", value: recipe.info.cuisine },
    { label: "Course", value: recipe.info.course },
    { label: "Method", value: recipe.info.method },
    { label: "Diet", value: recipe.info.diet },
  ];

  return (
    <aside className="space-y-6">
      <div className="rounded-card border border-[#141414] bg-[#0c0c0c] p-5 space-y-4">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
          Recipe Info
        </h2>
        <dl className="space-y-3">
          {infoRows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-foreground-muted">{row.label}</dt>
              <dd className="text-white text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="pt-3 border-t border-[#141414]">
          <p className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mb-2">
            Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recipe.info.keywords.map((keyword) => (
              <span
                key={keyword}
                className="font-mono text-[8px] uppercase tracking-wider px-2 py-1 rounded border border-[#262626] text-foreground-subtle"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-[#262626] rounded-md py-2.5 text-xs text-foreground-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Heart className="h-3.5 w-3.5" />
          Save Recipe
        </button>
      </div>

      <div className="rounded-card border border-[#141414] bg-[#0c0c0c] p-5 space-y-4">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
          Quick Facts
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Calories", value: String(recipe.nutrition.calories) },
            { label: "Protein", value: recipe.nutrition.protein },
            { label: "Carbs", value: recipe.nutrition.carbs },
            { label: "Fat", value: recipe.nutrition.fat },
          ].map((fact) => (
            <div key={fact.label} className="text-center">
              <span className="block text-lg font-light text-white">{fact.value}</span>
              <span className="font-mono text-[8px] uppercase tracking-widest text-foreground-muted">
                {fact.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-[#141414] bg-[#0c0c0c] p-5 space-y-3">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
          Notes
        </h2>
        <p className="font-serif italic text-xs text-foreground-muted leading-relaxed">
          {recipe.notes}
        </p>
      </div>
    </aside>
  );
}
