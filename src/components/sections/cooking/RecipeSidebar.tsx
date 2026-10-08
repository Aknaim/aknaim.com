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
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  const nutritionRows = [
    {
      label: "Calories",
      value:
        recipe.nutrition.calories != null && recipe.nutrition.calories > 0
          ? String(recipe.nutrition.calories)
          : undefined,
    },
    { label: "Protein", value: recipe.nutrition.protein },
    { label: "Carbs", value: recipe.nutrition.carbs },
    { label: "Fat", value: recipe.nutrition.fat },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <aside className="space-y-6">
      {infoRows.length > 0 || recipe.info.keywords.length > 0 ? (
        <div className="rounded-card border border-[#141414] bg-[#0c0c0c] p-5 space-y-4">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
            Recipe Info
          </h2>
          {infoRows.length > 0 ? (
            <dl className="space-y-3">
              {infoRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-foreground-muted">{row.label}</dt>
                  <dd className="text-white text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {recipe.info.keywords.length > 0 ? (
            <div className={infoRows.length > 0 ? "pt-3 border-t border-[#141414]" : undefined}>
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
          ) : null}
        </div>
      ) : null}

      {nutritionRows.length > 0 ? (
        <div className="rounded-card border border-[#141414] bg-[#0c0c0c] p-5 space-y-4">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
            Nutrition
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {nutritionRows.map((fact) => (
              <div key={fact.label} className="text-center">
                <span className="block text-lg font-light text-white">{fact.value}</span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-foreground-muted">
                  {fact.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {recipe.notes.trim() ? (
        <div className="rounded-card border border-[#141414] bg-[#0c0c0c] p-5 space-y-3">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
            Notes
          </h2>
          <p className="font-serif italic text-xs text-foreground-muted leading-relaxed">
            {recipe.notes}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
