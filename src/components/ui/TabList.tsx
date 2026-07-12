"use client";

import type { TabDefinition } from "@/types";

interface TabListProps {
  tabs: TabDefinition[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabList({ tabs, activeId, onChange }: TabListProps) {
  return (
    <div
      className="flex gap-5 overflow-x-auto border-b border-[#262626] pb-3 lg:gap-6"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 text-tab transition-colors ${
              isActive
                ? "text-accent"
                : "text-foreground-subtle hover:text-foreground-muted"
            }`}
          >
            <span
              className={`inline-block border-b-2 pb-1 ${
                isActive ? "border-accent" : "border-transparent"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
