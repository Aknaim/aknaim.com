"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";
import { formatLastActive } from "@/lib/interests/format";
import { pickScrollPeekId } from "@/lib/scroll-peek";
import { getInterestHref } from "@/lib/utils";

interface ActiveWorkbenchProps {
  items: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
  bagPeekHint?: string;
}

/** Match cupboard: scroll-peek stacked bags on narrow / no-hover. */
function useMobileWorkbenchLayout() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (hover: none)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return enabled;
}

export function ActiveWorkbench({
  items,
  fallbackBySrc,
  bagPeekHint = "Hover a bag to peek inside.",
}: ActiveWorkbenchProps) {
  const mobileLayout = useMobileWorkbenchLayout();
  const bagRefs = useRef(new Map<string, HTMLElement>());
  const peekedIdRef = useRef<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(
    items[0]?.id ?? null
  );
  const [peekedId, setPeekedId] = useState<string | null>(null);

  peekedIdRef.current = peekedId;

  const focused =
    items.find((item) => item.id === focusedId) ?? items[0] ?? null;

  useEffect(() => {
    if (!mobileLayout) {
      setPeekedId(null);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const entries = items.map((item) => ({
        id: item.id,
        element: bagRefs.current.get(item.id) ?? null,
      }));
      const next = pickScrollPeekId(entries, peekedIdRef.current, {
        bandY: 0.42,
        hysteresisPx: 56,
      });
      setPeekedId((prev) => (prev === next ? prev : next));
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [mobileLayout, items]);

  if (items.length === 0) {
    return null;
  }

  if (mobileLayout) {
    return (
      <section
        className="page-container relative z-20 py-8"
        aria-label="Active workbench"
      >
        <div className="mb-5">
          <p className="text-tab text-accent">Active Workbench</p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
            On the table
          </h2>
          <p className="mt-2 text-meta text-foreground-muted">
            Scroll to peek. Tap to open.
          </p>
        </div>

        <div className="workbench-table workbench-table--foreground rounded-card border border-[#2a2824] p-4">
          <ul className="relative z-10 flex flex-col gap-3">
            {items.map((item, index) => (
              <MobileWorkbenchBag
                key={item.id}
                item={item}
                shelfIndex={index + 1}
                bagFallback={fallbackBySrc[item.bagImage] ?? false}
                peekFallback={fallbackBySrc[item.peekImage] ?? false}
                isPeeked={peekedId === item.id}
                bagRef={(element) => {
                  if (element) bagRefs.current.set(item.id, element);
                  else bagRefs.current.delete(item.id);
                }}
              />
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      className="page-container relative z-20 py-8 lg:py-12"
      aria-label="Active workbench"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-tab text-accent">Active Workbench</p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
            On the table
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-meta text-foreground-muted sm:block">
          {bagPeekHint} Click to open.
        </p>
      </div>

      <div className="workbench-table workbench-table--foreground rounded-card border border-[#2a2824] p-4 sm:p-6 lg:p-8">
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div className="relative">
            <div
              className="workbench-spotlight pointer-events-none absolute inset-0 rounded-card"
              aria-hidden
            />
            <ul className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-4">
              {items.map((item) => (
                <WorkbenchItem
                  key={item.id}
                  item={item}
                  isActive={item.id === focused?.id}
                  bagFallback={fallbackBySrc[item.bagImage] ?? false}
                  onSelect={() => setFocusedId(item.id)}
                />
              ))}
            </ul>
          </div>

          <div className="relative min-h-[300px] lg:min-h-[340px]">
            {focused ? (
              <Link
                href={getInterestHref(focused.id)}
                className="group/peek block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <PeekFrame
                  item={focused}
                  peekFallback={fallbackBySrc[focused.peekImage] ?? false}
                />
              </Link>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-card border border-dashed border-[#3a342c] bg-[#1a1510]/50 p-6 text-center text-body-sm text-foreground-muted">
                Hover an item on the workbench to peek inside.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileWorkbenchBag({
  item,
  shelfIndex,
  bagFallback,
  peekFallback,
  isPeeked,
  bagRef,
}: {
  item: InterestCategory;
  shelfIndex: number;
  bagFallback: boolean;
  peekFallback: boolean;
  isPeeked: boolean;
  bagRef: (element: HTMLLIElement | null) => void;
}) {
  const Icon = getIcon(item.icon);
  const lastActiveLabel = formatLastActive(item.lastActive);

  return (
    <li ref={bagRef}>
      <Link
        href={getInterestHref(item.id)}
        className={`cupboard-dusty-bag group flex gap-3 rounded-card border border-[#2a2a2a] bg-[#121212]/70 p-3 transition-colors duration-300 ${
          isPeeked ? "cupboard-dusty-bag--peek" : ""
        }`}
      >
        <div className="cupboard-bag-thumb relative h-20 w-20 shrink-0 overflow-hidden rounded-image border border-[#1a1a1a]">
          <AssetImage
            src={item.bagImage}
            alt={`${item.label} on the workbench, shelf ${shelfIndex}`}
            icon={item.icon}
            forceFallback={bagFallback}
            fill
            sizes="80px"
            fallbackVariant="bag"
            fallbackMuted
            imageClassName="cupboard-bag-closed object-cover grayscale brightness-75 contrast-90 transition-opacity duration-300"
          />
          <AssetImage
            src={item.peekImage}
            alt={`Inside ${item.label}`}
            icon={item.icon}
            forceFallback={peekFallback}
            fill
            sizes="80px"
            fallbackVariant="peek"
            fallbackMuted
            className="cupboard-bag-open opacity-0 transition-opacity duration-300"
            imageClassName="object-cover brightness-110 contrast-100"
          />
          <div
            className="cupboard-bag-dust pointer-events-none absolute inset-0 bg-[#0a0a0a]/40 mix-blend-multiply transition-opacity duration-300"
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1 self-center">
          <div className="flex items-center gap-2">
            <Icon
              className="cupboard-bag-icon h-3.5 w-3.5 text-foreground-subtle transition-colors duration-300"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="cupboard-bag-label text-tab text-foreground-subtle transition-colors duration-300">
              {item.label}
            </span>
          </div>
          {item.bagTag ? (
            <p className="cupboard-bag-note mt-1.5 text-meta leading-snug text-foreground-muted">
              {item.bagTag}
            </p>
          ) : null}
          {lastActiveLabel ? (
            <p className="mt-1 text-meta text-foreground-subtle/70 normal-case tracking-normal">
              {lastActiveLabel}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

interface WorkbenchItemProps {
  item: InterestCategory;
  isActive: boolean;
  bagFallback: boolean;
  onSelect: () => void;
}

function WorkbenchItem({
  item,
  isActive,
  bagFallback,
  onSelect,
}: WorkbenchItemProps) {
  const Icon = getIcon(item.icon);
  const lastActiveLabel = formatLastActive(item.lastActive);

  return (
    <li className="relative">
      <div
        className={`workbench-item-spotlight ${isActive ? "workbench-item-spotlight--active" : ""}`}
        aria-hidden
      />
      <Link
        href={getInterestHref(item.id)}
        className={`group relative z-10 flex w-full flex-col items-center text-left outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-accent ${
          isActive ? "scale-[1.02]" : "scale-100"
        }`}
        onMouseEnter={onSelect}
        onFocus={onSelect}
        aria-current={isActive ? "true" : undefined}
        aria-label={`Open ${item.label}`}
      >
        <div
          className={`workbench-item-frame aspect-[4/3] w-full overflow-hidden rounded-card border ${
            isActive
              ? "workbench-item-frame--active border-accent/45"
              : "workbench-item-frame--inactive border-[#3a342c]"
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
                ? "bg-linear-to-t from-black/45 via-black/5 to-[rgba(197,160,89,0.14)]"
                : "bg-black/20"
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
            <p className="mt-2 line-clamp-2 text-meta leading-snug text-foreground-muted">
              {item.workbenchNote}
            </p>
          ) : null}
          {lastActiveLabel ? (
            <p className="mt-1 text-meta text-foreground-subtle normal-case tracking-normal">
              {lastActiveLabel}
            </p>
          ) : null}
        </div>
      </Link>
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
  const lastActiveLabel = formatLastActive(item.lastActive);

  return (
    <article
      key={item.id}
      className="peek-frame peek-frame-enter flex h-full flex-col"
    >
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
          <p className="mt-3 text-meta uppercase tracking-widest text-accent/80 opacity-0 transition-opacity group-hover/peek:opacity-100">
            Enter →
          </p>
        </div>
      </div>
      {item.workbenchNote || lastActiveLabel ? (
        <div className="relative z-10 border-t border-[#3a342c] bg-[#1a1510]/85 px-5 py-3.5 lg:px-6 space-y-1">
          {item.workbenchNote ? (
            <p className="text-meta text-foreground-muted">{item.workbenchNote}</p>
          ) : null}
          {lastActiveLabel ? (
            <p className="text-meta text-foreground-subtle normal-case tracking-normal">
              {lastActiveLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
