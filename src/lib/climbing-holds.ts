/** Bust browser/CDN cache when hold cutouts are regenerated. */
const HOLD_V = "8";

/** Individual hold cutouts (from `scripts/assets/climbing-holds-sheet.png` via split script). */
export const CLIMBING_HOLD_SRC = [
  `/images/climbing/holds/01-terracotta-jug.png?v=${HOLD_V}`,
  `/images/climbing/holds/02-olive-sloper.png?v=${HOLD_V}`,
  `/images/climbing/holds/03-tan-pocket.png?v=${HOLD_V}`,
  `/images/climbing/holds/04-charcoal-crimp.png?v=${HOLD_V}`,
  `/images/climbing/holds/05-terracotta-edge.png?v=${HOLD_V}`,
  `/images/climbing/holds/06-dual-tex.png?v=${HOLD_V}`,
  `/images/climbing/holds/07-olive-pinch.png?v=${HOLD_V}`,
  `/images/climbing/holds/08-charcoal-sloper.png?v=${HOLD_V}`,
  `/images/climbing/holds/09-terracotta-pocket.png?v=${HOLD_V}`,
  `/images/climbing/holds/10-olive-edge.png?v=${HOLD_V}`,
  `/images/climbing/holds/11-tan-crimp.png?v=${HOLD_V}`,
  `/images/climbing/holds/12-charcoal-pinch.png?v=${HOLD_V}`,
] as const;

/**
 * Prefer charcoal / tan / olive on the route; terracotta for the latest milestone.
 * Index into CLIMBING_HOLD_SRC.
 */
const MUTED_HOLD_ORDER = [3, 7, 11, 2, 10, 5, 1, 6, 9, 0, 4, 8] as const;

export function holdSrcForMilestone(index: number, count: number): string {
  const isLast = index === count - 1;
  if (isLast) {
    return CLIMBING_HOLD_SRC[0]; // terracotta jug — current high point
  }
  const holdIndex = MUTED_HOLD_ORDER[index % MUTED_HOLD_ORDER.length];
  return CLIMBING_HOLD_SRC[holdIndex];
}
