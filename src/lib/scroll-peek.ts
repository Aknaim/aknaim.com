/**
 * Pick the element whose vertical center is closest to a viewport band.
 * Hysteresis stops the highlight from jumping between neighbors.
 */
export function pickScrollPeekId(
  entries: ReadonlyArray<{ id: string; element: HTMLElement | null }>,
  previousId: string | null,
  options?: {
    /** 0–1, fraction of viewport height for the focus line. Default mid-upper. */
    bandY?: number;
    hysteresisPx?: number;
  }
): string | null {
  const bandY = options?.bandY ?? 0.42;
  const hysteresisPx = options?.hysteresisPx ?? 48;
  const vh = window.innerHeight || 1;
  const target = vh * bandY;

  let bestId: string | null = null;
  let bestDist = Infinity;
  let previousDist = Infinity;

  for (const { id, element } of entries) {
    if (!element) continue;
    const rect = element.getBoundingClientRect();
    // Ignore items that are mostly off-screen.
    if (rect.bottom < vh * 0.12 || rect.top > vh * 0.88) continue;
    const mid = rect.top + rect.height / 2;
    const dist = Math.abs(mid - target);
    if (id === previousId) previousDist = dist;
    if (dist < bestDist) {
      bestDist = dist;
      bestId = id;
    }
  }

  if (!bestId) return previousId;
  if (!previousId || previousId === bestId) return bestId;
  // Only switch when the new bag is clearly closer.
  return bestDist < previousDist - hysteresisPx ? bestId : previousId;
}
