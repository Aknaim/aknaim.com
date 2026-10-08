"use client";

import { useMemo, useState } from "react";
import { formatIngredientQty } from "@/lib/recipe/units";
import type { UnitSystem } from "@/lib/recipe/units";
import type { IngredientGroup } from "@/lib/types/recipe";

interface RecipeIngredientsProps {
  groups: IngredientGroup[];
  baseServings: number;
}

const SCALE_OPTIONS = [
  { id: "0.5", label: "½×", factor: 0.5 },
  { id: "1", label: "1×", factor: 1 },
  { id: "2", label: "2×", factor: 2 },
  { id: "3", label: "3×", factor: 3 },
] as const;

export function RecipeIngredients({ groups, baseServings }: RecipeIngredientsProps) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("us");
  const [scaleId, setScaleId] = useState<(typeof SCALE_OPTIONS)[number]["id"]>("1");

  const scale = useMemo(
    () => SCALE_OPTIONS.find((option) => option.id === scaleId)?.factor ?? 1,
    [scaleId]
  );
  const scaledServings = Math.max(1, Math.round(baseServings * scale));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-[#141414] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Ingredients
          </h2>
          <p className="font-mono text-[9px] text-foreground-subtle mt-1">
            {scaledServings} serving{scaledServings === 1 ? "" : "s"}
            {scale !== 1 ? ` · scaled from ${baseServings}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 border border-[#141414] rounded-md p-0.5">
            {SCALE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setScaleId(option.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  scaleId === option.id
                    ? "bg-[#1a1a1a] text-accent"
                    : "text-foreground-muted hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border border-[#141414] rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setUnitSystem("us")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                unitSystem === "us"
                  ? "bg-[#1a1a1a] text-accent"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              US
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem("metric")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                unitSystem === "metric"
                  ? "bg-[#1a1a1a] text-accent"
                  : "text-foreground-muted hover:text-white"
              }`}
            >
              Metric
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {groups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => {
                const qty = formatIngredientQty(
                  item.amount,
                  item.unit,
                  unitSystem,
                  scale
                );
                return (
                  <li
                    key={`${item.name}-${item.note ?? ""}-${item.amount}`}
                    className="flex gap-3 text-sm text-foreground-muted border-b border-[#141414]/60 pb-2"
                  >
                    <span className="font-mono text-[10px] text-accent/70 w-20 shrink-0 pt-0.5">
                      {qty}
                    </span>
                    <span className="text-foreground">
                      {item.name}
                      {item.note ? (
                        <span className="text-foreground-muted">, {item.note}</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
