"use client";

import { useState } from "react";
import Link from "next/link";

// Updated to use optional properties (?) matching your static data layout
interface TabItem {
  id: string;
  title: string;
  meta: string;
  thumbnail?: string;
  linkUrl?: string;
}

interface TabData {
  id: string;
  label: string;
  items: TabItem[];
}

export function InterestTabsContainer({ tabs }: { tabs: TabData[] }) {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? "");
  
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (tabs.length === 0) return null;

  return (
    <div className="w-full max-w-xl">
      {/* Tab Navigation header matching the UI underlines */}
      <div className="flex gap-6 border-b border-[#1f1f1f] pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={`text-xs uppercase tracking-wider font-medium pb-2 transition-all relative ${
              activeTabId === tab.id 
                ? "text-accent" 
                : "text-foreground-muted hover:text-foreground-subtle"
            }`}
          >
            {tab.label}
            {activeTabId === tab.id && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[1px] bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Row Items list */}
      <ul className="mt-6 space-y-3">
        {activeTab?.items.map((item) => {
          const isLink = !!item.linkUrl;
          const rowClassName = `flex items-center justify-between p-3 rounded-card border border-[#141414] bg-[#111111]/40 transition-all ${
            isLink
              ? "hover:border-[#262626] hover:bg-[#141414]/80 group cursor-pointer"
              : ""
          }`;

          const rowBody = (
            <>
              <div className="flex min-w-0 items-center gap-3">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="h-8 w-8 rounded-md border border-[#262626] object-cover brightness-75 mix-blend-luminosity transition-all group-hover:brightness-100"
                  />
                ) : null}
                <div className="min-w-0">
                  <h3 className="text-body-sm font-medium text-foreground transition-colors group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-meta text-foreground-muted">
                    {item.meta}
                  </p>
                </div>
              </div>
              {isLink ? (
                <span className="translate-x-[-4px] pr-1 text-xs text-foreground-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  →
                </span>
              ) : null}
            </>
          );

          return (
            <li key={item.id}>
              {isLink ? (
                <Link href={item.linkUrl as string} className={rowClassName}>
                  {rowBody}
                </Link>
              ) : (
                <div className={rowClassName}>{rowBody}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}