"use client";

import { useState } from "react";
import type { FilterGroup, GalleryFilters, GalleryItem } from "@/lib/types/gallery";
import { countAllForFilterGroup, countItemsForFilter } from "@/lib/gallery-utils";

interface GallerySidebarProps {
  filterGroups: FilterGroup[];
  items: GalleryItem[];
  filters: GalleryFilters;
  onFilterChange: (paramKey: string, value: string) => void;
  onReset: () => void;
  /** Count unique climbs/trips/etc. instead of photos when set */
  countDistinctKey?: string;
  /** Paginated galleries don't have a full item set for accurate option counts. */
  hideCounts?: boolean;
}

export function GallerySidebar({
  filterGroups,
  items,
  filters,
  onFilterChange,
  onReset,
  countDistinctKey,
  hideCounts = false,
}: GallerySidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of filterGroups) {
      if (group.defaultCollapsed) {
        const active = Boolean(filters[group.paramKey] && filters[group.paramKey] !== "all");
        initial[group.id] = active;
      }
    }
    return initial;
  });

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sort" && value && value !== "all"
  );

  function isGroupOpen(group: FilterGroup): boolean {
    if (!group.defaultCollapsed) return true;
    return Boolean(expanded[group.id]);
  }

  function toggleGroup(group: FilterGroup) {
    setExpanded((prev) => ({ ...prev, [group.id]: !prev[group.id] }));
  }

  return (
    <aside className="w-full lg:w-56 shrink-0 space-y-8">
      {filterGroups.map((group) => {
        const open = isGroupOpen(group);
        const activeValue = filters[group.paramKey];
        const activeLabel =
          activeValue && activeValue !== "all"
            ? group.options.find((option) => option.id === activeValue)?.label
            : null;

        return (
          <div key={group.id} className="space-y-3">
            {group.defaultCollapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between gap-2 text-left group"
                aria-expanded={open}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted group-hover:text-white transition-colors">
                  {group.label}
                  {activeLabel && !open ? (
                    <span className="ml-2 normal-case tracking-normal text-accent/80">
                      · {activeLabel}
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[9px] text-foreground-subtle">
                  {open ? "−" : "+"}
                </span>
              </button>
            ) : (
              <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
                {group.label}
              </h2>
            )}

            {open ? (
              group.type === "list" ? (
                <ul className="space-y-1">
                  {group.allowAll && (
                    <li>
                      <FilterButton
                        label="All"
                        count={
                          hideCounts
                            ? undefined
                            : countAllForFilterGroup(
                                items,
                                group.paramKey,
                                filters,
                                countDistinctKey
                              )
                        }
                        active={!filters[group.paramKey] || filters[group.paramKey] === "all"}
                        onClick={() => onFilterChange(group.paramKey, "all")}
                      />
                    </li>
                  )}
                  {group.options.map((option) => {
                    const count = hideCounts
                      ? undefined
                      : countItemsForFilter(
                          items,
                          group.paramKey,
                          option.id,
                          filters,
                          countDistinctKey
                        );
                    // Hide empty grade options so the long -/flat/+ list stays usable.
                    if (
                      !hideCounts &&
                      group.paramKey === "grade" &&
                      count === 0
                    ) {
                      return null;
                    }
                    return (
                      <li key={option.id}>
                        <FilterButton
                          label={option.label}
                          count={count}
                          active={filters[group.paramKey] === option.id}
                          onClick={() => onFilterChange(group.paramKey, option.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <select
                  value={filters[group.paramKey] ?? "all"}
                  onChange={(e) => onFilterChange(group.paramKey, e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-[#141414] rounded-md px-3 py-2 text-xs text-foreground-muted focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
                >
                  {group.allowAll && <option value="all">All</option>}
                  {group.options.map((option) => {
                    const count = hideCounts
                      ? undefined
                      : countItemsForFilter(
                          items,
                          group.paramKey,
                          option.id,
                          filters,
                          countDistinctKey
                        );
                    return (
                      <option key={option.id} value={option.id}>
                        {!hideCounts && countDistinctKey
                          ? `${option.label} (${count})`
                          : option.label}
                      </option>
                    );
                  })}
                </select>
              )
            ) : null}
          </div>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle hover:text-accent transition-colors"
        >
          Reset Filters
        </button>
      )}
    </aside>
  );
}

interface FilterButtonProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-xs transition-colors ${
        active
          ? "text-accent bg-accent/5 border border-accent/20"
          : "text-foreground-muted hover:text-white hover:bg-[#141414] border border-transparent"
      }`}
    >
      <span>{label}</span>
      {count !== undefined ? (
        <span className="font-mono text-[9px] text-foreground-subtle">{count}</span>
      ) : null}
    </button>
  );
}

interface GallerySortSelectProps {
  sortOptions: { id: string; label: string }[];
  value: string;
  onChange: (sortId: string) => void;
}

export function GallerySortSelect({ sortOptions, value, onChange }: GallerySortSelectProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
        Sort By
      </h2>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0c0c0c] border border-[#141414] rounded-md px-3 py-2 text-xs text-foreground-muted focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
