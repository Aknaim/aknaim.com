"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { GalleryFiltersSheet } from "./GalleryFiltersSheet";
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

function countSummary(items: GalleryItem[], distinctKey?: string): number {
  if (!distinctKey) return items.length;
  const keys = new Set<string>();
  for (const item of items) {
    const value = item.filters[distinctKey];
    if (value) keys.add(value);
  }
  return keys.size;
}

export type GalleryPaginationProps = {
  pageSize: number;
  total: number;
  /** Server distinct count when config.countDistinctKey is set (e.g. climbs). */
  totalDistinct?: number;
  hasMore: boolean;
};

interface GalleryViewProps {
  config: GalleryConfig;
  items: GalleryItem[];
  initialFilters: GalleryFilters;
  showDuration?: boolean;
  /** When set, items are a first page — load more on scroll via /api/gallery/[interest]. */
  pagination?: GalleryPaginationProps;
  /**
   * Lightweight filter rows for sidebar counts under pagination
   * (send-grade-aware for climbing). No media URLs.
   */
  filterIndex?: Array<{ filters: Record<string, string> }>;
}

type GalleryPageResponse = {
  items: GalleryItem[];
  total: number;
  totalDistinct?: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  error?: string;
};

export function GalleryView({
  config,
  items: initialItems,
  initialFilters,
  showDuration = false,
  pagination,
  filterIndex,
}: GalleryViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<GalleryViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { activeIndex, isOpen, open, close, setActiveIndex } = useImageLightbox();

  const [filters, setFilters] = useState<GalleryFilters>(() => ({
    ...initialFilters,
    sort: initialFilters.sort ?? config.defaultSort,
  }));

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [total, setTotal] = useState(pagination?.total ?? initialItems.length);
  const [totalDistinct, setTotalDistinct] = useState(pagination?.totalDistinct);
  const [hasMore, setHasMore] = useState(pagination?.hasMore ?? false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const paramKeys = config.filterGroups.map((g) => g.paramKey);
  const paged = Boolean(pagination);

  /** Items used only for sidebar/sheet option counts. */
  const countItems = useMemo((): GalleryItem[] => {
    if (filterIndex) {
      return filterIndex.map((row, index) => ({
        id: `filter-index-${index}`,
        src: "",
        alt: "",
        dateTaken: "",
        year: 0,
        filters: row.filters,
      }));
    }
    return paged ? [] : items;
  }, [filterIndex, paged, items]);

  const hideCounts = paged && !filterIndex;

  const syncUrl = useCallback(
    (nextFilters: GalleryFilters) => {
      const qs = buildGalleryQueryString(nextFilters);
      router.replace(`/gallery/${config.interest}${qs}`, { scroll: false });
    },
    [config.interest, router]
  );

  const buildApiQuery = useCallback(
    (nextFilters: GalleryFilters, offset: number) => {
      const params = new URLSearchParams();
      params.set("offset", String(offset));
      params.set("limit", String(pagination?.pageSize ?? 48));
      const sort = nextFilters.sort ?? config.defaultSort;
      if (sort) params.set("sort", sort);
      // Include configured filters plus deep-link keys (e.g. climb=slug from progression).
      const keys = new Set([...paramKeys, ...Object.keys(nextFilters)]);
      for (const key of keys) {
        if (key === "sort") continue;
        const value = nextFilters[key];
        if (value && value !== "all") params.set(key, value);
      }
      return params.toString();
    },
    [pagination?.pageSize, config.defaultSort, paramKeys]
  );

  const fetchPage = useCallback(
    async (nextFilters: GalleryFilters, offset: number, mode: "replace" | "append") => {
      if (!paged) return;
      const requestId = ++requestIdRef.current;
      if (mode === "replace") setLoadingReset(true);
      else setLoadingMore(true);
      setLoadError(null);

      try {
        const qs = buildApiQuery(nextFilters, offset);
        const res = await fetch(`/api/gallery/${config.interest}?${qs}`);
        const data = (await res.json()) as GalleryPageResponse;
        if (requestId !== requestIdRef.current) return;
        if (!res.ok) {
          setLoadError(data.error ?? "Could not load photos.");
          return;
        }
        setTotal(data.total);
        setTotalDistinct(data.totalDistinct);
        setHasMore(data.hasMore);
        setItems((prev) => {
          if (mode === "replace") return data.items;
          const seen = new Set(prev.map((item) => item.id));
          const merged = [...prev];
          for (const item of data.items) {
            if (!seen.has(item.id)) merged.push(item);
          }
          return merged;
        });
      } catch {
        if (requestId === requestIdRef.current) {
          setLoadError("Could not load photos.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingMore(false);
          setLoadingReset(false);
        }
      }
    },
    [paged, buildApiQuery, config.interest]
  );

  const handleFilterChange = useCallback(
    (paramKey: string, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [paramKey]: value === "all" ? "" : value };
        if (value === "all") delete next[paramKey];
        syncUrl(next);
        if (paged) void fetchPage(next, 0, "replace");
        return next;
      });
    },
    [syncUrl, paged, fetchPage]
  );

  const handleSortChange = useCallback(
    (sortId: string) => {
      setFilters((prev) => {
        const next = { ...prev, sort: sortId };
        syncUrl(next);
        if (paged) void fetchPage(next, 0, "replace");
        return next;
      });
    },
    [syncUrl, paged, fetchPage]
  );

  const handleReset = useCallback(() => {
    const next: GalleryFilters = { sort: config.defaultSort };
    setFilters(next);
    syncUrl(next);
    if (paged) void fetchPage(next, 0, "replace");
  }, [config.defaultSort, syncUrl, paged, fetchPage]);

  useEffect(() => {
    if (!paged || !hasMore || loadingMore || loadingReset) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        void fetchPage(filters, items.length, "append");
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [paged, hasMore, loadingMore, loadingReset, fetchPage, filters, items.length]);

  const displayItems = useMemo(() => {
    if (paged) return items;
    const filterOnly: GalleryFilters = {};
    for (const key of paramKeys) {
      if (filters[key]) filterOnly[key] = filters[key];
    }
    const filtered = filterGalleryItems(items, filterOnly);
    return sortGalleryItems(filtered, filters.sort ?? config.defaultSort);
  }, [paged, items, filters, paramKeys, config.defaultSort]);

  const summaryNoun = config.summaryNoun ?? {
    singular: "Photo",
    plural: "Photos",
  };

  const summaryLine = useMemo(() => {
    if (loadingReset) return "Loading…";

    if (paged) {
      const photoLabel = total === 1 ? "photo" : "photos";
      if (config.countDistinctKey && totalDistinct != null) {
        const entityLabel =
          totalDistinct === 1
            ? summaryNoun.singular.toLowerCase()
            : summaryNoun.plural.toLowerCase();
        const base = `${totalDistinct} ${entityLabel} · ${total} ${photoLabel}`;
        return displayItems.length < total
          ? `${base} · showing ${displayItems.length}`
          : base;
      }
      return displayItems.length < total
        ? `${total} ${photoLabel} · showing ${displayItems.length}`
        : `${total} ${photoLabel}`;
    }

    const summaryCount = countSummary(displayItems, config.countDistinctKey);
    const summaryLabel =
      summaryCount === 1 ? summaryNoun.singular : summaryNoun.plural;
    return `${summaryCount} ${summaryLabel}`;
  }, [
    loadingReset,
    paged,
    total,
    totalDistinct,
    displayItems,
    config.countDistinctKey,
    summaryNoun.singular,
    summaryNoun.plural,
  ]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) => key !== "sort" && value && value !== "all"
      ).length,
    [filters]
  );

  const activeTripLabel = filters.trip
    ? config.filterGroups
        .find((g) => g.paramKey === "trip")
        ?.options.find((o) => o.id === filters.trip)?.label
    : undefined;

  const lightboxImages = useMemo(
    () => toLightboxImages(displayItems),
    [displayItems]
  );

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= displayItems.length) {
      close();
    }
  }, [activeIndex, displayItems.length, close]);

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-8">
            <GallerySortSelect
              sortOptions={config.sortOptions}
              value={filters.sort ?? config.defaultSort}
              onChange={handleSortChange}
            />
            <GallerySidebar
              filterGroups={config.filterGroups}
              items={countItems}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              countDistinctKey={config.countDistinctKey}
              hideCounts={hideCounts}
            />
          </div>

          <div className="flex-1 min-w-0">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#141414] pb-6 mb-8">
              <div className="space-y-2">
                <span className="text-eyebrow tracking-[0.25em] text-accent/80 block">
                  {config.interest}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-white">
                  {config.title}
                </h1>
                <p className="text-foreground-muted text-base max-w-md leading-relaxed">
                  {activeTripLabel
                    ? `Photos from ${activeTripLabel}. ${config.subtitle}`
                    : config.subtitle}
                </p>
                <span className="text-eyebrow text-foreground-subtle">
                  {summaryLine}
                </span>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-end">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-md border border-[#1a1a1a] bg-[#0c0c0c] px-3 py-2 text-eyebrow text-foreground-muted transition-colors hover:border-[#2a2a2a] hover:text-white"
                >
                  Filters
                  {activeFilterCount > 0 ? (
                    <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-accent">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
                <GalleryViewToggle viewMode={viewMode} onChange={setViewMode} />
              </div>
            </header>

            <GalleryGrid
              items={displayItems}
              viewMode={viewMode}
              showDuration={showDuration}
              onItemClick={open}
            />

            {paged ? (
              <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-8">
                {loadError ? (
                  <p className="text-eyebrow text-red-400">
                    {loadError}
                  </p>
                ) : loadingMore ? (
                  <p className="text-eyebrow text-foreground-subtle">
                    Loading more…
                  </p>
                ) : hasMore ? (
                  <p className="text-eyebrow text-foreground-subtle">
                    Scroll for more
                  </p>
                ) : displayItems.length > 0 ? (
                  <p className="text-eyebrow text-foreground-subtle">
                    End of gallery
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-12 flex justify-center border-t border-[#141414] pt-8">
              <button
                type="button"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="text-eyebrow text-foreground-muted hover:text-white transition-colors"
              >
                ↑ Back to top
              </button>
            </div>
          </div>
        </div>
      </div>

      <GalleryFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filterGroups={config.filterGroups}
        sortOptions={config.sortOptions}
        items={countItems}
        filters={filters}
        sortValue={filters.sort ?? config.defaultSort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onReset={handleReset}
        countDistinctKey={config.countDistinctKey}
        hideCounts={hideCounts}
      />

      <ImageLightbox
        images={lightboxImages}
        activeIndex={isOpen ? activeIndex : null}
        onClose={close}
        onIndexChange={setActiveIndex}
      />
    </main>
  );
}
