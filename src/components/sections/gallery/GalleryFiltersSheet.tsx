"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { FilterGroup, GalleryFilters, GalleryItem } from "@/lib/types/gallery";
import { GallerySidebar, GallerySortSelect } from "./GallerySidebar";

interface GalleryFiltersSheetProps {
  open: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  sortOptions: { id: string; label: string }[];
  items: GalleryItem[];
  filters: GalleryFilters;
  sortValue: string;
  onFilterChange: (paramKey: string, value: string) => void;
  onSortChange: (sortId: string) => void;
  onReset: () => void;
  countDistinctKey?: string;
  hideCounts?: boolean;
}

export function GalleryFiltersSheet({
  open,
  onClose,
  filterGroups,
  sortOptions,
  items,
  filters,
  sortValue,
  onFilterChange,
  onSortChange,
  onReset,
  countDistinctKey,
  hideCounts,
}: GalleryFiltersSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => setEntered(true));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Gallery filters">
      <button
        type="button"
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Close filters"
      />

      <aside
        className={`absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] shadow-none transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#141414] px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
            Filters
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1a1a1a] text-foreground-muted transition-colors hover:border-[#2a2a2a] hover:text-white"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 py-6">
          <GallerySortSelect
            sortOptions={sortOptions}
            value={sortValue}
            onChange={onSortChange}
          />
          <GallerySidebar
            filterGroups={filterGroups}
            items={items}
            filters={filters}
            onFilterChange={onFilterChange}
            onReset={onReset}
            countDistinctKey={countDistinctKey}
            hideCounts={hideCounts}
          />
        </div>

        <div className="border-t border-[#141414] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-accent/35 bg-accent/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
          >
            Done
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
