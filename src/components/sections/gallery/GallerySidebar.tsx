"use client";

import type { FilterGroup, GalleryFilters, GalleryItem } from "@/lib/types/gallery";
import { countItemsForFilter } from "@/lib/gallery-utils";

interface GallerySidebarProps {
  filterGroups: FilterGroup[];
  items: GalleryItem[];
  filters: GalleryFilters;
  onFilterChange: (paramKey: string, value: string) => void;
  onReset: () => void;
}

export function GallerySidebar({
  filterGroups,
  items,
  filters,
  onFilterChange,
  onReset,
}: GallerySidebarProps) {
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sort" && value && value !== "all"
  );

  return (
    <aside className="w-full lg:w-56 shrink-0 space-y-8">
      {filterGroups.map((group) => (
        <div key={group.id} className="space-y-3">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-muted">
            {group.label}
          </h2>

          {group.type === "list" ? (
            <ul className="space-y-1">
              {group.allowAll && (
                <li>
                  <FilterButton
                    label="All"
                    count={countAllForGroup(items, group.paramKey, filters)}
                    active={!filters[group.paramKey] || filters[group.paramKey] === "all"}
                    onClick={() => onFilterChange(group.paramKey, "all")}
                  />
                </li>
              )}
              {group.options.map((option) => (
                <li key={option.id}>
                  <FilterButton
                    label={option.label}
                    count={countItemsForFilter(items, group.paramKey, option.id, filters)}
                    active={filters[group.paramKey] === option.id}
                    onClick={() => onFilterChange(group.paramKey, option.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <select
              value={filters[group.paramKey] ?? "all"}
              onChange={(e) => onFilterChange(group.paramKey, e.target.value)}
              className="w-full bg-[#0c0c0c] border border-[#141414] rounded-md px-3 py-2 text-xs text-foreground-muted focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
            >
              {group.allowAll && <option value="all">All</option>}
              {group.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

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

function countAllForGroup(
  items: GalleryItem[],
  paramKey: string,
  activeFilters: GalleryFilters
): number {
  const otherFilters = { ...activeFilters };
  delete otherFilters[paramKey];
  delete otherFilters.sort;

  return items.filter((item) =>
    Object.entries(otherFilters).every(([key, value]) => {
      if (!value || value === "all") return true;
      return item.filters[key] === value;
    })
  ).length;
}

interface FilterButtonProps {
  label: string;
  count: number;
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
      <span className="font-mono text-[9px] text-foreground-subtle">{count}</span>
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
