export type IngredientUnitId =
  | "count"
  | "cup"
  | "tbsp"
  | "tsp"
  | "fl_oz"
  | "oz"
  | "lb"
  | "ml"
  | "l"
  | "g"
  | "kg"
  | "clove"
  | "slice"
  | "bunch"
  | "pinch"
  | "handful"
  | "to_taste"
  | "as_needed"
  | "text";

export type UnitSystem = "us" | "metric";

export type IngredientUnitOption = {
  id: IngredientUnitId;
  label: string;
  system: UnitSystem | "both" | "none";
  scalable: boolean;
};

/** Admin unit picker — amount is always in this unit; display converts. */
export const INGREDIENT_UNITS: IngredientUnitOption[] = [
  { id: "count", label: "count (#)", system: "both", scalable: true },
  { id: "cup", label: "cup", system: "us", scalable: true },
  { id: "tbsp", label: "tbsp", system: "us", scalable: true },
  { id: "tsp", label: "tsp", system: "us", scalable: true },
  { id: "fl_oz", label: "fl oz", system: "us", scalable: true },
  { id: "oz", label: "oz", system: "us", scalable: true },
  { id: "lb", label: "lb", system: "us", scalable: true },
  { id: "ml", label: "ml", system: "metric", scalable: true },
  { id: "l", label: "l", system: "metric", scalable: true },
  { id: "g", label: "g", system: "metric", scalable: true },
  { id: "kg", label: "kg", system: "metric", scalable: true },
  { id: "clove", label: "clove", system: "both", scalable: true },
  { id: "slice", label: "slice", system: "both", scalable: true },
  { id: "bunch", label: "bunch", system: "both", scalable: true },
  { id: "pinch", label: "pinch", system: "both", scalable: false },
  { id: "handful", label: "handful", system: "both", scalable: false },
  { id: "to_taste", label: "to taste", system: "none", scalable: false },
  { id: "as_needed", label: "as needed", system: "none", scalable: false },
  { id: "text", label: "other / freeform", system: "none", scalable: false },
];

const UNIT_LABEL: Record<IngredientUnitId, string> = Object.fromEntries(
  INGREDIENT_UNITS.map((unit) => [unit.id, unit.label])
) as Record<IngredientUnitId, string>;

const ML: Record<string, number> = {
  tsp: 4.92892,
  tbsp: 14.7868,
  fl_oz: 29.5735,
  cup: 236.588,
  ml: 1,
  l: 1000,
};

const G: Record<string, number> = {
  oz: 28.3495,
  lb: 453.592,
  g: 1,
  kg: 1000,
};

export function parseAmount(value: string): number | null {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("/")) {
    const [a, b] = raw.split("/").map((part) => Number(part.trim()));
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b;
  }
  const mixed = raw.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const num = Number(mixed[2]);
    const den = Number(mixed[3]);
    if (![whole, num, den].every(Number.isFinite) || den === 0) return null;
    return whole + num / den;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const fractions: Array<[number, string]> = [
    [0.25, "1/4"],
    [0.33, "1/3"],
    [1 / 3, "1/3"],
    [0.5, "1/2"],
    [0.66, "2/3"],
    [2 / 3, "2/3"],
    [0.75, "3/4"],
  ];

  const whole = Math.floor(abs);
  const frac = abs - whole;
  for (const [target, label] of fractions) {
    if (Math.abs(frac - target) < 0.03) {
      return whole === 0 ? `${sign}${label}` : `${sign}${whole} ${label}`;
    }
  }

  const rounded = Math.round(abs * 100) / 100;
  return `${sign}${Number.isInteger(rounded) ? String(rounded) : String(rounded)}`;
}

function convertVolume(amount: number, from: IngredientUnitId, toSystem: UnitSystem): {
  amount: number;
  unit: IngredientUnitId;
} {
  const ml = amount * (ML[from] ?? 1);
  if (toSystem === "metric") {
    if (ml >= 1000) return { amount: ml / 1000, unit: "l" };
    return { amount: ml, unit: "ml" };
  }
  if (ml >= ML.cup) return { amount: ml / ML.cup, unit: "cup" };
  if (ml >= ML.tbsp) return { amount: ml / ML.tbsp, unit: "tbsp" };
  return { amount: ml / ML.tsp, unit: "tsp" };
}

function convertWeight(amount: number, from: IngredientUnitId, toSystem: UnitSystem): {
  amount: number;
  unit: IngredientUnitId;
} {
  const g = amount * (G[from] ?? 1);
  if (toSystem === "metric") {
    if (g >= 1000) return { amount: g / 1000, unit: "kg" };
    return { amount: g, unit: "g" };
  }
  if (g >= G.lb) return { amount: g / G.lb, unit: "lb" };
  return { amount: g / G.oz, unit: "oz" };
}

export function isVolumeUnit(unit: IngredientUnitId): boolean {
  return unit in ML;
}

export function isWeightUnit(unit: IngredientUnitId): boolean {
  return unit in G;
}

export function convertUnit(
  amount: number,
  unit: IngredientUnitId,
  toSystem: UnitSystem
): { amount: number; unit: IngredientUnitId } {
  if (isVolumeUnit(unit)) return convertVolume(amount, unit, toSystem);
  if (isWeightUnit(unit)) return convertWeight(amount, unit, toSystem);
  return { amount, unit };
}

export function scaleAmount(amount: string, factor: number, unit: IngredientUnitId): string {
  const option = INGREDIENT_UNITS.find((entry) => entry.id === unit);
  if (!option?.scalable) return amount;
  const n = parseAmount(amount);
  if (n == null) return amount;
  return formatAmount(n * factor);
}

export function formatIngredientQty(
  amount: string,
  unit: IngredientUnitId,
  system: UnitSystem,
  scale = 1
): string {
  if (unit === "to_taste") return "To taste";
  if (unit === "as_needed") return "As needed";
  if (unit === "handful") return scale !== 1 ? `${formatAmount(scale)} handful` : "Handful";
  if (unit === "pinch") return scale !== 1 ? `${formatAmount(scale)} pinch` : "Pinch";
  if (unit === "text") return amount;

  const scaled = scaleAmount(amount, scale, unit);
  const n = parseAmount(scaled);
  if (n == null) {
    return [scaled, unit === "count" ? "" : UNIT_LABEL[unit]].filter(Boolean).join(" ");
  }

  if (unit === "count" || unit === "clove" || unit === "slice" || unit === "bunch") {
    const label =
      unit === "count" ? "" : n === 1 ? UNIT_LABEL[unit] : `${UNIT_LABEL[unit]}s`;
    return [formatAmount(n), label].filter(Boolean).join(" ");
  }

  if (isVolumeUnit(unit) || isWeightUnit(unit)) {
    const converted = convertUnit(n, unit, system);
    const label = UNIT_LABEL[converted.unit];
    return `${formatAmount(converted.amount)} ${label}`;
  }

  return [formatAmount(n), UNIT_LABEL[unit]].filter(Boolean).join(" ");
}

/** Best-effort parse of legacy freeform quantity strings from the old dual fields. */
export function parseLegacyIngredient(
  quantity: string,
  quantityMetric: string,
  name: string
): { amount: string; unit: IngredientUnitId; name: string; note: string } {
  const noteMatch = name.match(/^(.*?),\s*(.+)$/);
  const cleanName = noteMatch?.[1]?.trim() || name;
  const note = noteMatch?.[2]?.trim() || "";

  const raw = quantity.trim();
  const lower = raw.toLowerCase();

  if (lower === "to taste") {
    return { amount: "", unit: "to_taste", name: cleanName, note };
  }
  if (lower === "handful") {
    return { amount: "", unit: "handful", name: cleanName, note };
  }
  if (lower === "as needed") {
    return { amount: "", unit: "as_needed", name: cleanName, note };
  }

  const patterns: Array<[RegExp, IngredientUnitId]> = [
    [/^([\d./\s]+)\s*cups?$/i, "cup"],
    [/^([\d./\s]+)\s*tbsp$/i, "tbsp"],
    [/^([\d./\s]+)\s*tsp$/i, "tsp"],
    [/^([\d./\s]+)\s*fl\.?\s*oz$/i, "fl_oz"],
    [/^([\d./\s]+)\s*oz$/i, "oz"],
    [/^([\d./\s]+)\s*lbs?$/i, "lb"],
    [/^([\d./\s]+)\s*ml$/i, "ml"],
    [/^([\d./\s]+)\s*l$/i, "l"],
    [/^([\d./\s]+)\s*kg$/i, "kg"],
    [/^([\d./\s]+)\s*g$/i, "g"],
    [/^([\d./\s]+)\s*cloves?$/i, "clove"],
    [/^([\d./\s]+)\s*slices?$/i, "slice"],
  ];

  for (const [re, unit] of patterns) {
    const match = raw.match(re);
    if (match) {
      return { amount: match[1].trim(), unit, name: cleanName, note };
    }
  }

  if (/^\d+(\.\d+)?$/.test(raw) || /^\d+\s+\d+\/\d+$/.test(raw) || /^\d+\/\d+$/.test(raw)) {
    return { amount: raw, unit: "count", name: cleanName, note };
  }

  // Prefer metric string when US field already looks metric-identical.
  if (quantity === quantityMetric && /ml|g|kg|l/i.test(raw)) {
    return { amount: raw, unit: "text", name: cleanName, note };
  }

  return { amount: raw, unit: "text", name: cleanName, note };
}

export function categoryLabel(id: string): string {
  const labels: Record<string, string> = {
    dinner: "Dinner",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dessert: "Dessert",
    baking: "Baking",
    snacks: "Snacks",
  };
  return labels[id] ?? id;
}

export { cuisineLabel } from "@/lib/recipe/cuisines";
