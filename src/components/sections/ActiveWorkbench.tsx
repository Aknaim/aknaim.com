"use client";

import Link from "next/link";
import { useState } from "react";
import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";
import { siteData } from "@/lib/data";

interface ActiveWorkbenchProps {
  items: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
}

export function ActiveWorkbench({
  items,
  fallbackBySrc,
}: ActiveWorkbenchProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(
    items[0]?.id ?? null,
  );

  const focused =
    items.find((item) => item.id === hoveredId) ?? items[0] ?? null;

  return (
    <section
      className="page-container py-8 lg:py-10"
      aria-label="Active workbench"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-tab text-accent">Active Workbench</p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
            On the table
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-meta text-foreground-subtle sm:block">
          {siteData.personal.bagPeekHint}
        </p>
      </div>

      <div className="workbench-table rounded-card border border-[#262626] p-4 sm:p-6 lg:p-8">
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div className="relative">
            <div
              className="workbench-spotlight pointer-events-none absolute inset-0 rounded-card"
              aria-hidden
            />
            <ul className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
              {items.map((item) => (
                <WorkbenchItem
                  key={item.id}
                  item={item}
                  isActive={item.id === focused?.id}
                  bagFallback={fallbackBySrc[item.bagImage] ?? true}
                  onEnter={() => setHoveredId(item.id)}
                  onFocus={() => setHoveredId(item.id)}
                />
              ))}
            </ul>
          </div>

          <div className="relative min-h-[300px] lg:min-h-[340px]">
            {focused ? (
              <Link 
                href={
                  focused.id === "travel"
                    ? "/travel"
                    : focused.id === "climbing"
                      ? "/climbing"
                      : focused.id === "cooking"
                        ? "/cooking"
                        : `/interests/${focused.id}`
                }
                className="group/peek block h-full outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-card">
                <PeekFrame
                  item={focused}
                  peekFallback={fallbackBySrc[focused.peekImage] ?? true}
                />
              </Link>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-card border border-dashed border-[#262626] bg-[#141414]/60 p-6 text-center text-body-sm text-foreground-subtle">
                Hover an item on the workbench to peek inside.
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-meta text-foreground-subtle sm:hidden">
        {siteData.personal.bagPeekHint}
      </p>
    </section>
  );
}

interface WorkbenchItemProps {
  item: InterestCategory;
  isActive: boolean;
  bagFallback: boolean;
  onEnter: () => void;
  onFocus: () => void;
}

function WorkbenchItem({
  item,
  isActive,
  bagFallback,
  onEnter,
  onFocus,
}: WorkbenchItemProps) {
  const Icon = getIcon(item.icon);

  return (
    <li className="relative">
      <div
        className={`workbench-item-spotlight ${isActive ? "workbench-item-spotlight--active" : ""}`}
        aria-hidden
      />
      <button
        type="button"
        className={`group relative z-10 flex w-full flex-col items-center text-left transition-transform duration-300 ${
          isActive ? "scale-[1.02]" : "scale-100"
        }`}
        onMouseEnter={onEnter}
        onFocus={onFocus}
        aria-label={`Peek inside ${item.label}`}
      >
        <div
          className={`workbench-item-frame aspect-[4/3] w-full overflow-hidden rounded-card border ${
            isActive
              ? "workbench-item-frame--active border-accent/45"
              : "workbench-item-frame--inactive border-[#262626]"
          }`}
        >
          <AssetImage
            src={item.bagImage}
            alt={`${item.label} gear on the workbench`}
            icon={item.icon}
            forceFallback={bagFallback}
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            fallbackVariant="bag"
            imageClassName="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
              isActive
                ? "bg-linear-to-t from-black/60 via-black/10 to-[rgba(197,160,89,0.12)]"
                : "bg-black/35"
            }`}
            aria-hidden
          />
        </div>

        <div className="mt-3 w-full px-0.5">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-accent" : "text-foreground-muted"}`}
              strokeWidth={1.5}
              aria-hidden
            />
            <span
              className={`text-tab ${isActive ? "text-accent" : "text-foreground-muted"}`}
            >
              {item.label}
            </span>
          </div>
          {item.workbenchNote ? (
            <p className="mt-2 line-clamp-2 text-meta leading-snug text-foreground-subtle">
              {item.workbenchNote}
            </p>
          ) : null}
        </div>
      </button>
    </li>
  );
}

function PeekFrame({
  item,
  peekFallback,
}: {
  item: InterestCategory;
  peekFallback: boolean;
}) {
  return (
    <article key={item.id} className="peek-frame peek-frame-enter flex h-full flex-col">
      <div className="relative min-h-[240px] flex-1 lg:min-h-[280px]">
        <AssetImage
          src={item.peekImage}
          alt={`Inside ${item.label}: ${item.peekCaption}`}
          icon={item.icon}
          forceFallback={peekFallback}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          priority
          fallbackVariant="peek"
          imageClassName="object-cover transition-transform duration-500 group-hover/peek:scale-[1.02]"
        />
        <div className="peek-frame-glow" aria-hidden />
        <div className="absolute bottom-0 left-0 right-0 z-10 p-5 lg:p-6">
          <p className="text-tab text-accent">{item.label}</p>
          <p className="mt-2 max-w-sm text-body-sm leading-relaxed text-foreground">
            {item.peekCaption}
          </p>
        </div>
      </div>
      {item.workbenchNote ? (
        <div className="relative z-10 border-t border-[#262626] bg-[#141414]/90 px-5 py-3.5 lg:px-6">
          <p className="text-meta text-foreground-muted">{item.workbenchNote}</p>
        </div>
      ) : null}
    </article>
  );
}
