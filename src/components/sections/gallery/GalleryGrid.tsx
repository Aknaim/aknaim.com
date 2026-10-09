"use client";

import Image from "next/image";
import { LayoutGrid, List, Play } from "lucide-react";
import { shouldSkipImageOptimizer } from "@/lib/media/skip-image-optimizer";
import type { GalleryItem, GalleryViewMode } from "@/lib/types/gallery";

interface GalleryGridProps {
  items: GalleryItem[];
  viewMode: GalleryViewMode;
  showDuration?: boolean;
  onItemClick?: (index: number) => void;
}

function thumbSrc(item: GalleryItem): string {
  if (item.mediaType === "video") {
    return item.posterSrc ?? item.src;
  }
  return item.src;
}

function isVideo(item: GalleryItem): boolean {
  return item.mediaType === "video";
}

export function GalleryGrid({ items, viewMode, showDuration = false, onItemClick }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-lg text-foreground-muted">No photos match these filters.</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle mt-2">
          Try adjusting or resetting your filters
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="group flex gap-4 rounded-card border border-[#141414] bg-[#0c0c0c] p-3 hover:border-[#262626] transition-colors cursor-pointer"
            onClick={() => onItemClick?.(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onItemClick?.(index);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-image border border-[#1a1a1a]">
              <Image
                src={thumbSrc(item)}
                alt={item.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="112px"
                unoptimized={shouldSkipImageOptimizer(thumbSrc(item))}
              />
              {isVideo(item) && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <Play className="h-3 w-3 fill-white text-white" />
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-sm text-white font-medium truncate">{item.title ?? item.alt}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mt-1">
                {item.dateTaken}
                {showDuration && item.duration ? ` · ${item.duration}` : ""}
                {isVideo(item) ? " · Video" : ""}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {items.map((item, index) => (
        <figure
          key={item.id}
          className="group relative aspect-[4/5] overflow-hidden rounded-image border border-[#141414] bg-[#0c0c0c] cursor-pointer hover:border-[#262626] transition-all duration-300"
          onClick={() => onItemClick?.(index)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onItemClick?.(index);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Image
            src={thumbSrc(item)}
            alt={item.alt}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={shouldSkipImageOptimizer(thumbSrc(item))}
          />
          <figcaption className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-[#070707]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs text-white font-medium">{item.title ?? item.alt}</span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-foreground-muted mt-0.5">
              {item.dateTaken}
            </span>
          </figcaption>
          {isVideo(item) && (
            <>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                  <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                </span>
              </span>
              {showDuration && item.duration ? (
                <span className="absolute bottom-2 right-2 font-mono text-[9px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                  {item.duration}
                </span>
              ) : null}
            </>
          )}
        </figure>
      ))}
    </div>
  );
}

interface GalleryViewToggleProps {
  viewMode: GalleryViewMode;
  onChange: (mode: GalleryViewMode) => void;
}

export function GalleryViewToggle({ viewMode, onChange }: GalleryViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border border-[#141414] rounded-md p-0.5">
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
        className={`p-1.5 rounded transition-colors ${
          viewMode === "grid" ? "bg-[#1a1a1a] text-accent" : "text-foreground-muted hover:text-white"
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
        className={`p-1.5 rounded transition-colors ${
          viewMode === "list" ? "bg-[#1a1a1a] text-accent" : "text-foreground-muted hover:text-white"
        }`}
      >
        <List className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
