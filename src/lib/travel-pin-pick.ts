/** localStorage key for map pin picks from /travel?pinPick=1 (cross-tab with admin). */
export const TRAVEL_PIN_STORAGE_KEY = "aknaim-travel-pin-pick";

export type TravelPinPick = {
  x: number;
  y: number;
};

export function isSafeTravelAdminReturn(path: string): boolean {
  if (!path.startsWith("/admin/travel")) return false;
  if (path.includes("//") || path.includes("\\")) return false;
  return true;
}

function parsePin(raw: string | null): TravelPinPick | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TravelPinPick>;
    const x = Number(parsed.x);
    const y = Number(parsed.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  } catch {
    return null;
  }
}

export function readTravelPinPick(): TravelPinPick | null {
  if (typeof window === "undefined") return null;
  return parsePin(localStorage.getItem(TRAVEL_PIN_STORAGE_KEY));
}

export function writeTravelPinPick(pin: TravelPinPick): void {
  localStorage.setItem(TRAVEL_PIN_STORAGE_KEY, JSON.stringify(pin));
}

export function clearTravelPinPick(): void {
  localStorage.removeItem(TRAVEL_PIN_STORAGE_KEY);
}
