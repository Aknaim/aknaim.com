"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  hasMore: boolean;
};

interface GalleryViewProps {
  config: GalleryConfig;
  items: GalleryItem[];
  initialFilters: GalleryFilters;
  backHref?: string;
  backLabel?: string;
  showDuration?: boolean;
  /** When set, items are a first page — load more on scroll via /api/gallery/[interest]. */
  pagination?: GalleryPaginationProps;
}

type GalleryPageResponse = {
  items: GalleryItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  error?: string;
};

export function GalleryView({
  config,
  items: initialItems,
  initialFilters,
  backHref = "/",
  backLabel = "← Back",
  showDuration = false,
  pagination,
}: GalleryViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<GalleryViewMode>("grid");
  const { activeIndex, isOpen, open, close, setActiveIndex } = useImageLightbox();

  const [filters, setFilters] = useState<GalleryFilters>(() => ({
    ...initialFilters,
    sort: initialFilters.sort ?? config.defaultSort,
  }));

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [total, setTotal] = useState(pagination?.total ?? initialItems.length);
  const [hasMore, setHasMore] = useState(pagination?.hasMore ?? false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const paramKeys = config.filterGroups.map((g) => g.paramKey);
  const paged = Boolean(pagination);

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
      for (const key of paramKeys) {
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

  const summaryCount = useMemo(() => {
    if (paged && !config.countDistinctKey) return total;
    return countSummary(displayItems, config.countDistinctKey);
  }, [paged, total, displayItems, config.countDistinctKey]);

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
              items={paged ? [] : items}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              countDistinctKey={config.countDistinctKey}
              hideCounts={paged}
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
                  {loadingReset ? "Loading…" : `${summaryCount} ${summaryLabel}`}
                  {paged && displayItems.length < total
                    ? ` · showing ${displayItems.length}`
                    : ""}
                </span>
              </div>
              <GalleryViewToggle viewMode={viewMode} onChange={setViewMode} />
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
                  <p className="font-mono text-[10px] uppercase tracking-widest text-red-400">
                    {loadError}
                  </p>
                ) : loadingMore ? (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle">
                    Loading more…
                  </p>
                ) : hasMore ? (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle">
                    Scroll for more
                  </p>
                ) : displayItems.length > 0 ? (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle">
                    End of gallery
                  </p>
                ) : null}
              </div>
            ) : null}
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
