"use client";

import Link from "next/link";
import { useState } from "react";
import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";
import { formatLastActive } from "@/lib/interests/format";
import { getInterestHref } from "@/lib/utils";

interface StorageCupboardProps {
  items: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
}

export function StorageCupboard({
  items,
  fallbackBySrc,
}: StorageCupboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="page-container relative z-10 py-8 lg:py-12"
      aria-label="Stowed gear"
    >
      <div className="cupboard-backdrop">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-tab text-foreground-subtle">Archive</p>
            <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground-muted">
              The Storage Cupboard
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-meta text-foreground-subtle sm:block">
            Hover to open. Dusty gear waiting for the next season.
          </p>
        </div>

        <div
          className={`cupboard-cabinet rounded-card ${isOpen ? "cupboard-cabinet--open" : ""}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocusCapture={() => setIsOpen(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsOpen(false);
            }
          }}
        >
          <div className="cupboard-doors" aria-hidden={isOpen}>
            <div className="cupboard-door cupboard-door--left">
              <span className="cupboard-door-handle" />
            </div>
            <div className="cupboard-door cupboard-door--right">
              <span className="cupboard-door-handle" />
            </div>
          </div>

          <div
            className="cupboard-interior"
            aria-hidden={!isOpen}
            {...(!isOpen ? { inert: true } : {})}
          >
            <ul className="grid h-full gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6 lg:p-8">
              {items.map((item, index) => (
                <CupboardBag
                  key={item.id}
                  item={item}
                  shelfIndex={index + 1}
                  bagFallback={fallbackBySrc[item.bagImage] ?? false}
                  peekFallback={fallbackBySrc[item.peekImage] ?? false}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CupboardBag({
  item,
  shelfIndex,
  bagFallback,
  peekFallback,
}: {
  item: InterestCategory;
  shelfIndex: number;
  bagFallback: boolean;
  peekFallback: boolean;
}) {
  const Icon = getIcon(item.icon);
  const lastActiveLabel = formatLastActive(item.lastActive);

  return (
    <li>
      <Link
        href={getInterestHref(item.id)}
        className="cupboard-dusty-bag group flex gap-3 rounded-card border border-[#2a2a2a] bg-[#121212]/70 p-3 transition-colors duration-300 hover:border-accent/35 hover:bg-[#1a1a1a]/95"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-image border border-[#1a1a1a] sm:h-20 sm:w-20 group-hover:border-[#2e2e2e]">
          <AssetImage
            src={item.bagImage}
            alt={`${item.label} stowed on shelf ${shelfIndex}`}
            icon={item.icon}
            forceFallback={bagFallback}
            fill
            sizes="80px"
            fallbackVariant="cupboard"
            fallbackMuted
            imageClassName="object-cover grayscale brightness-75 contrast-90 transition-opacity duration-300 group-hover:opacity-0"
          />
          <AssetImage
            src={item.peekImage}
            alt={`${item.label} opened on shelf ${shelfIndex}`}
            icon={item.icon}
            forceFallback={peekFallback}
            fill
            sizes="80px"
            fallbackVariant="cupboard"
            fallbackMuted
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            imageClassName="object-cover brightness-110 contrast-100"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[#0a0a0a]/40 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1 self-center">
          <div className="flex items-center gap-2">
            <Icon
              className="h-3.5 w-3.5 text-foreground-subtle transition-colors duration-300 group-hover:text-accent"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="text-tab text-foreground-subtle transition-colors duration-300 group-hover:text-white">
              {item.label}
            </span>
          </div>
          {item.workbenchNote ? (
            <p className="mt-1.5 line-clamp-2 text-meta leading-snug text-foreground-subtle/80 transition-colors duration-300 group-hover:text-foreground-muted">
              {item.workbenchNote}
            </p>
          ) : null}
          {lastActiveLabel ? (
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-foreground-subtle/60">
              {lastActiveLabel}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
