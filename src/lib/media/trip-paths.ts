/**
 * Canonical on-disk / R2 layout for a trip.
 *
 * travel/{tripId}/
 *   highlight.webp  — destination card + travel index background
 *   hero.webp       — trip detail hero (can match highlight)
 *   map.webp        — route map (pin % coords are relative to this image)
 *   gear.webp
 *   gallery/        — bulk photos → gallery_items with filters.trip
 *   moments/
 *   favorites/
 */
export function tripMediaPaths(tripId: string) {
  const root = `travel/${tripId}`;
  return {
    root,
    highlightFolder: root,
    highlightFile: "highlight.webp",
    heroFolder: root,
    heroFile: "hero.webp",
    mapFolder: root,
    mapFile: "map.webp",
    gearFolder: root,
    gearFile: "gear.webp",
    galleryFolder: `${root}/gallery`,
    momentsFolder: `${root}/moments`,
    favoritesFolder: `${root}/favorites`,
  } as const;
}
