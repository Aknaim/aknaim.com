"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useImageLightbox } from "@/hooks/useImageLightbox";
import type { GalleryConfig, GalleryFilters, GalleryItem, GalleryViewMode } from "@/lib/types/gallery";
import type { LightboxImage } from "@/lib/types/lightbox";
import {
  buildGalleryQueryString,
  filterGalleryItems,
  sortGalleryItems,
} from "@/lib/gallery-utils";
import { GalleryGrid, GalleryViewToggle } from "./GalleryGrid";
import { GallerySidebar, GallerySortSelect } from "./GallerySidebar";

function toLightboxImages(items: GalleryItem[]): LightboxImage[] {
  return items.map((item) => ({
    id: item.id,
    src: item.src,
    alt: item.alt,
    title: item.title ?? item.alt,
    subtitle: item.dateTaken,
    href: item.recipeSlug ? `/cooking/${item.recipeSlug}` : undefined,
    mediaType: item.mediaType,
    posterSrc: item.posterSrc,
  }));
}

function countSummary(
  items: GalleryItem[],
  distinctKey?: string
): number {
  if (!distinctKey) return items.length;
  const keys = new Set<string>();
  for (const item of items) {
    const value = item.filters[distinctKey];
    if (value) keys.add(value);
  }
  return keys.size;
}

interface GalleryViewProps {
  config: GalleryConfig;
  items: GalleryItem[];
  initialFilters: GalleryFilters;
  backHref?: string;
  backLabel?: string;
  showDuration?: boolean;
}

export function GalleryView({
  config,
  items,
  initialFilters,
  backHref = "/",
  backLabel = "← Back",
  showDuration = false,
}: GalleryViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<GalleryViewMode>("grid");
  const { activeIndex, isOpen, open, close, setActiveIndex } = useImageLightbox();

  const [filters, setFilters] = useState<GalleryFilters>(() => ({
    ...initialFilters,
    sort: initialFilters.sort ?? config.defaultSort,
  }));

  const paramKeys = config.filterGroups.map((g) => g.paramKey);

  const syncUrl = useCallback(
    (nextFilters: GalleryFilters) => {
      const qs = buildGalleryQueryString(nextFilters);
      router.replace(`/gallery/${config.interest}${qs}`, { scroll: false });
    },
    [config.interest, router]
  );

  const handleFilterChange = useCallback(
    (paramKey: string, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [paramKey]: value === "all" ? "" : value };
        if (value === "all") delete next[paramKey];
        syncUrl(next);
        return next;
      });
    },
    [syncUrl]
  );

  const handleSortChange = useCallback(
    (sortId: string) => {
      setFilters((prev) => {
        const next = { ...prev, sort: sortId };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl]
  );

  const handleReset = useCallback(() => {
    const next: GalleryFilters = { sort: config.defaultSort };
    setFilters(next);
    syncUrl(next);
  }, [config.defaultSort, syncUrl]);

  const filteredItems = useMemo(() => {
    const filterOnly: GalleryFilters = {};
    for (const key of paramKeys) {
      if (filters[key]) filterOnly[key] = filters[key];
    }
    const filtered = filterGalleryItems(items, filterOnly);
    return sortGalleryItems(filtered, filters.sort ?? config.defaultSort);
  }, [items, filters, paramKeys, config.defaultSort]);

  const summaryCount = useMemo(
    () => countSummary(filteredItems, config.countDistinctKey),
    [filteredItems, config.countDistinctKey]
  );
  const summaryNoun = config.summaryNoun ?? {
    singular: "Photo",
    plural: "Photos",
  };
  const summaryLabel =
    summaryCount === 1 ? summaryNoun.singular : summaryNoun.plural;

  const activeTripLabel = filters.trip
    ? config.filterGroups
        .find((g) => g.paramKey === "trip")
        ?.options.find((o) => o.id === filters.trip)?.label
    : undefined;

  const lightboxImages = useMemo(
    () => toLightboxImages(filteredItems),
    [filteredItems]
  );

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= filteredItems.length) {
      close();
    }
  }, [activeIndex, filteredItems.length, close]);

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-12">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group mb-8"
        >
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span>
          {backLabel.replace(/^←\s*/, "")}
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-8">
            <GallerySortSelect
              sortOptions={config.sortOptions}
              value={filters.sort ?? config.defaultSort}
              onChange={handleSortChange}
            />
            <GallerySidebar
              filterGroups={config.filterGroups}
              items={items}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              countDistinctKey={config.countDistinctKey}
            />
          </div>

          <div className="flex-1 min-w-0">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#141414] pb-6 mb-8">
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
                  {config.interest}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-white">
                  {config.title}
                </h1>
                <p className="text-foreground-muted text-sm max-w-md leading-relaxed">
                  {activeTripLabel
                    ? `Photos from ${activeTripLabel}. ${config.subtitle}`
                    : config.subtitle}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle">
                  {summaryCount} {summaryLabel}
                </span>
              </div>
              <GalleryViewToggle viewMode={viewMode} onChange={setViewMode} />
            </header>

            <GalleryGrid
              items={filteredItems}
              viewMode={viewMode}
              showDuration={showDuration}
              onItemClick={open}
            />
          </div>
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        activeIndex={isOpen ? activeIndex : null}
        onClose={close}
        onIndexChange={setActiveIndex}
      />
    </main>
  );
}
