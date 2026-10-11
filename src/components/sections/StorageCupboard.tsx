"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { InterestCategory } from "@/types";
import { AssetImage } from "@/components/ui/AssetImage";
import { getIcon } from "@/lib/icon-map";
import { formatLastActive } from "@/lib/interests/format";
import { pickScrollPeekId } from "@/lib/scroll-peek";
import { getInterestHref } from "@/lib/utils";

interface StorageCupboardProps {
  items: InterestCategory[];
  fallbackBySrc: Record<string, boolean>;
}

/** Narrow / touch: scroll-scrub doors + bag peeks. Desktop: hover / snap open. */
function useMobileCupboard() {
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

function openProgressFromRect(rect: DOMRect, viewportHeight: number): number {
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visible = Math.max(0, visibleBottom - visibleTop);
  const span = Math.min(rect.height, viewportHeight * 0.9);
  if (span <= 0) return 0;
  const ratio = visible / span;
  const start = 0.48;
  const end = 0.9;
  return Math.min(1, Math.max(0, (ratio - start) / (end - start)));
}

export function StorageCupboard({
  items,
  fallbackBySrc,
}: StorageCupboardProps) {
  const mobile = useMobileCupboard();
  const cabinetRef = useRef<HTMLDivElement>(null);
  const bagRefs = useRef(new Map<string, HTMLElement>());
  const peekedIdRef = useRef<string | null>(null);

  const [openedByHover, setOpenedByHover] = useState(false);
  const [openProgress, setOpenProgress] = useState(0);
  const [peekedId, setPeekedId] = useState<string | null>(null);

  peekedIdRef.current = peekedId;

  // Desktop: hover/focus only (original). Mobile: scroll-scrub.
  const isInteractive = mobile ? openProgress >= 0.72 : openedByHover;

  // Mobile: scrub door angle from how much of the cabinet is visible.
  useEffect(() => {
    if (!mobile) {
      setOpenProgress(0);
      return;
    }

    const node = cabinetRef.current;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      let next = openProgressFromRect(rect, vh);
      if (reduceMotion.matches) {
        next = next >= 0.4 ? 1 : 0;
      }
      setOpenProgress((prev) => (Math.abs(prev - next) < 0.004 ? prev : next));
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    reduceMotion.addEventListener("change", measure);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      reduceMotion.removeEventListener("change", measure);
    };
  }, [mobile]);

  // Mobile: one bag peeked — closest to mid-viewport, with hysteresis.
  useEffect(() => {
    if (!mobile || !isInteractive) {
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
        bandY: 0.45,
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
  }, [mobile, isInteractive, items]);

  if (items.length === 0) {
    return null;
  }

  const doorAngle = openProgress * 72;
  const doorOpacity = Math.max(0, 1 - Math.max(0, openProgress - 0.82) / 0.18);
  const interiorOpacity = Math.min(
    1,
    Math.max(0, (openProgress - 0.28) / 0.5)
  );

  const scrubStyle = mobile
    ? ({
        "--cupboard-open": openProgress,
        "--cupboard-door-angle": `${doorAngle}deg`,
        "--cupboard-door-opacity": doorOpacity,
        "--cupboard-interior-opacity": interiorOpacity,
      } as CSSProperties)
    : undefined;

  return (
    <section
      className="page-container relative z-10 py-8 lg:py-12"
      aria-label="Stowed gear"
    >
      <div
        className={`cupboard-backdrop ${openedByHover && !mobile ? "cupboard-backdrop--open" : ""}`}
        style={
          mobile ? { opacity: 0.9 + openProgress * 0.1 } : undefined
        }
      >
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-tab text-foreground-subtle">Archive</p>
            <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground-muted">
              The Storage Cupboard
            </h2>
          </div>
          <p className="max-w-xs text-meta text-foreground-subtle sm:text-right">
            <span className="sm:hidden">Scroll to open. </span>
            <span className="hidden sm:inline">Hover to open. </span>
            Dusty gear waiting for the next season.
          </p>
        </div>

        <div
          ref={cabinetRef}
          className={`cupboard-cabinet rounded-card ${
            mobile ? "cupboard-cabinet--scrub" : ""
          } ${isInteractive ? "cupboard-cabinet--open" : ""}`}
          style={scrubStyle}
          onMouseEnter={() => {
            if (!mobile) setOpenedByHover(true);
          }}
          onMouseLeave={() => {
            if (!mobile) setOpenedByHover(false);
          }}
          onFocusCapture={() => {
            if (!mobile) setOpenedByHover(true);
          }}
          onBlurCapture={(event) => {
            if (mobile) return;
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setOpenedByHover(false);
            }
          }}
        >
          <div className="cupboard-doors" aria-hidden={isInteractive}>
            <div className="cupboard-door cupboard-door--left">
              <span className="cupboard-door-handle" />
            </div>
            <div className="cupboard-door cupboard-door--right">
              <span className="cupboard-door-handle" />
            </div>
          </div>

          <div
            className="cupboard-interior"
            aria-hidden={!isInteractive}
            {...(!isInteractive ? { inert: true } : {})}
          >
            <ul className="grid h-full gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6 lg:p-8">
              {items.map((item, index) => (
                <CupboardBag
                  key={item.id}
                  item={item}
                  shelfIndex={index + 1}
                  bagFallback={fallbackBySrc[item.bagImage] ?? false}
                  peekFallback={fallbackBySrc[item.peekImage] ?? false}
                  isPeeked={mobile && peekedId === item.id}
                  bagRef={(element) => {
                    if (element) bagRefs.current.set(item.id, element);
                    else bagRefs.current.delete(item.id);
                  }}
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
