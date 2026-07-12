"use client";

import { useState } from "react";
import type { IngredientGroup } from "@/lib/types/recipe";

interface RecipeIngredientsProps {
  groups: IngredientGroup[];
}

export function RecipeIngredients({ groups }: RecipeIngredientsProps) {
  const [unit, setUnit] = useState<"us" | "metric">("us");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#141414] pb-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Ingredients
        </h2>
        <div className="flex items-center gap-1 border border-[#141414] rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setUnit("us")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
              unit === "us" ? "bg-[#1a1a1a] text-accent" : "text-foreground-muted hover:text-white"
            }`}
          >
            US
          </button>
          <button
            type="button"
            onClick={() => setUnit("metric")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
              unit === "metric" ? "bg-[#1a1a1a] text-accent" : "text-foreground-muted hover:text-white"
            }`}
          >
            Metric
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {groups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="flex gap-3 text-sm text-foreground-muted border-b border-[#141414]/60 pb-2"
                >
                  <span className="font-mono text-[10px] text-accent/70 w-16 shrink-0 pt-0.5">
                    {unit === "us" ? item.quantity : item.quantityMetric}
                  </span>
                  <span className="text-foreground">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
