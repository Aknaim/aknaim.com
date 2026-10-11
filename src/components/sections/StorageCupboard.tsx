"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";
import { formatLastActive } from "@/lib/interests/format";
import { getInterestHref } from "@/lib/utils";

interface StorageCupboardProps {
  items: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
}

/** Touch / narrow viewports — bag peek is scroll-driven instead of hover. */
function useScrollBagPeekEnabled() {
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

export function StorageCupboard({
  items,
  fallbackBySrc,
}: StorageCupboardProps) {
  const cabinetRef = useRef<HTMLDivElement>(null);
  const [openedByScroll, setOpenedByScroll] = useState(false);
  const [openedByHover, setOpenedByHover] = useState(false);
  const [peekedId, setPeekedId] = useState<string | null>(null);
  const scrollBagPeek = useScrollBagPeekEnabled();

  const isOpen = openedByScroll || openedByHover;

  useEffect(() => {
    const node = cabinetRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Open once a solid chunk of the cabinet is on screen; close when
        // it mostly leaves so scrolling back up resets the doors.
        setOpenedByScroll(
          entry.isIntersecting && entry.intersectionRatio >= 0.28
        );
      },
      { threshold: [0, 0.28, 0.45, 0.7, 1], rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
            Opens as you scroll. Dusty gear waiting for the next season.
          </p>
        </div>

        <div
          ref={cabinetRef}
          className={`cupboard-cabinet rounded-card ${isOpen ? "cupboard-cabinet--open" : ""}`}
          onMouseEnter={() => setOpenedByHover(true)}
          onMouseLeave={() => setOpenedByHover(false)}
          onFocusCapture={() => setOpenedByHover(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setOpenedByHover(false);
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
                  isPeeked={scrollBagPeek && peekedId === item.id}
                  observeScrollPeek={scrollBagPeek && isOpen}
                  onBecomePeeked={() => setPeekedId(item.id)}
                  onLeavePeek={() =>
                    setPeekedId((current) =>
                      current === item.id ? null : current
                    )
                  }
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
  isPeeked,
  observeScrollPeek,
  onBecomePeeked,
  onLeavePeek,
}: {
  item: InterestCategory;
  shelfIndex: number;
  bagFallback: boolean;
  peekFallback: boolean;
  isPeeked: boolean;
  observeScrollPeek: boolean;
  onBecomePeeked: () => void;
  onLeavePeek: () => void;
}) {
  const bagRef = useRef<HTMLLIElement>(null);
  const becomeRef = useRef(onBecomePeeked);
  const leaveRef = useRef(onLeavePeek);
  becomeRef.current = onBecomePeeked;
  leaveRef.current = onLeavePeek;

  const Icon = getIcon(item.icon);
  const lastActiveLabel = formatLastActive(item.lastActive);

  useEffect(() => {
    const node = bagRef.current;
    if (!node || !observeScrollPeek) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const peeking =
          entry.isIntersecting && entry.intersectionRatio >= 0.72;
        if (peeking) becomeRef.current();
        else leaveRef.current();
      },
      {
        threshold: [0, 0.5, 0.72, 1],
        // Bias toward the middle band of the viewport on phones.
        rootMargin: "-28% 0px -28% 0px",
      }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      leaveRef.current();
    };
  }, [observeScrollPeek]);

  return (
    <li ref={bagRef}>
      <Link
        href={getInterestHref(item.id)}
        className={`cupboard-dusty-bag group flex gap-3 rounded-card border border-[#2a2a2a] bg-[#121212]/70 p-3 transition-colors duration-300 hover:border-accent/35 hover:bg-[#1a1a1a]/95 ${
          isPeeked ? "cupboard-dusty-bag--peek" : ""
        }`}
      >
        <div className="cupboard-bag-thumb relative h-16 w-16 shrink-0 overflow-hidden rounded-image border border-[#1a1a1a] sm:h-20 sm:w-20 group-hover:border-[#2e2e2e]">
          <AssetImage
            src={item.bagImage}
            alt={`${item.label} stowed on shelf ${shelfIndex}`}
            icon={item.icon}
            forceFallback={bagFallback}
            fill
            sizes="80px"
            fallbackVariant="cupboard"
            fallbackMuted
            imageClassName="cupboard-bag-closed object-cover grayscale brightness-75 contrast-90 transition-opacity duration-300 group-hover:opacity-0"
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
            className="cupboard-bag-open opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            imageClassName="object-cover brightness-110 contrast-100"
          />
          <div
            className="cupboard-bag-dust pointer-events-none absolute inset-0 bg-[#0a0a0a]/40 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1 self-center">
          <div className="flex items-center gap-2">
            <Icon
              className="cupboard-bag-icon h-3.5 w-3.5 text-foreground-subtle transition-colors duration-300 group-hover:text-accent"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="cupboard-bag-label text-tab text-foreground-subtle transition-colors duration-300 group-hover:text-white">
              {item.label}
            </span>
          </div>
          {item.workbenchNote ? (
            <p className="cupboard-bag-note mt-1.5 line-clamp-2 text-meta leading-snug text-foreground-subtle/80 transition-colors duration-300 group-hover:text-foreground-muted">
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
