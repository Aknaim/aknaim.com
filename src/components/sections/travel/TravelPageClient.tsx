"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/travelData";

interface TravelPageClientProps {
  destinations: Destination[];
  travelStats: {
    places: number;
    photos: string;
    notes: string;
    memories: string;
  };
  /** Temporary placement aid: open /travel?pinGrid=1 — remove query to hide. */
  showPinGrid?: boolean;
}

/** Must match public/images/travel/world-map-dark.jpg (object-cover pin math). */
const WORLD_MAP_NATURAL = { width: 1536, height: 1024 };
/** Prefer western hemisphere in frame so NA isn’t crushed under the copy wash. */
const WORLD_MAP_OBJECT_POSITION = { x: 28, y: 50 };

function mapImageRect(containerW: number, containerH: number) {
  const containerRatio = containerW / containerH;
  const imageRatio = WORLD_MAP_NATURAL.width / WORLD_MAP_NATURAL.height;

  let renderedWidth = containerW;
  let renderedHeight = containerH;
  let offsetX = 0;
  let offsetY = 0;

  if (containerRatio > imageRatio) {
    renderedHeight = containerW / imageRatio;
    offsetY =
      (containerH - renderedHeight) * (WORLD_MAP_OBJECT_POSITION.y / 100);
  } else {
    renderedWidth = containerH * imageRatio;
    offsetX =
      (containerW - renderedWidth) * (WORLD_MAP_OBJECT_POSITION.x / 100);
  }

  return { renderedWidth, renderedHeight, offsetX, offsetY };
}

function mapPinPosition(
  containerW: number,
  containerH: number,
  xPercent: number,
  yPercent: number
) {
  const { renderedWidth, renderedHeight, offsetX, offsetY } = mapImageRect(
    containerW,
    containerH
  );

  return {
    left: offsetX + (xPercent / 100) * renderedWidth,
    top: offsetY + (yPercent / 100) * renderedHeight,
  };
}

function screenToImagePercent(
  containerW: number,
  containerH: number,
  clientX: number,
  clientY: number,
  containerLeft: number,
  containerTop: number
) {
  const { renderedWidth, renderedHeight, offsetX, offsetY } = mapImageRect(
    containerW,
    containerH
  );
  const x =
    ((clientX - containerLeft - offsetX) / renderedWidth) * 100;
  const y =
    ((clientY - containerTop - offsetY) / renderedHeight) * 100;
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

function PinGridOverlay({
  width,
  height,
  sample,
}: {
  width: number;
  height: number;
  sample: { x: number; y: number } | null;
}) {
  if (width === 0 || height === 0) return null;

  const { renderedWidth, renderedHeight, offsetX, offsetY } = mapImageRect(
    width,
    height
  );
  const step = 5;
  const majors = new Set([0, 25, 50, 75, 100]);

  return (
    <div
      className="absolute z-[35] pointer-events-none"
      style={{
        left: offsetX,
        top: offsetY,
        width: renderedWidth,
        height: renderedHeight,
      }}
    >
      {Array.from({ length: 100 / step + 1 }, (_, i) => i * step).map((pct) => {
        const major = majors.has(pct);
        const lineClass = major
          ? "bg-[#e6ca65]/45"
          : "bg-[#e6ca65]/15";
        return (
          <div key={`v-${pct}`}>
            <div
              className={`absolute top-0 bottom-0 w-px ${lineClass}`}
              style={{ left: `${pct}%` }}
            />
            {major ? (
              <span
                className="absolute top-1 -translate-x-1/2 font-mono text-[9px] text-[#e6ca65] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
                style={{ left: `${pct}%` }}
              >
                {pct}
              </span>
            ) : null}
          </div>
        );
      })}
      {Array.from({ length: 100 / step + 1 }, (_, i) => i * step).map((pct) => {
        const major = majors.has(pct);
        const lineClass = major
          ? "bg-[#e6ca65]/45"
          : "bg-[#e6ca65]/15";
        return (
          <div key={`h-${pct}`}>
            <div
              className={`absolute left-0 right-0 h-px ${lineClass}`}
              style={{ top: `${pct}%` }}
            />
            {major ? (
              <span
                className="absolute left-1 -translate-y-1/2 font-mono text-[9px] text-[#e6ca65] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
                style={{ top: `${pct}%` }}
              >
                {pct}
              </span>
            ) : null}
          </div>
        );
      })}
      {sample ? (
        <>
          <div
            className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
            style={{ left: `${sample.x}%`, top: `${sample.y}%` }}
          />
          <div
            className="absolute h-px bg-red-400/70 left-0 right-0"
            style={{ top: `${sample.y}%` }}
          />
          <div
            className="absolute w-px bg-red-400/70 top-0 bottom-0"
            style={{ left: `${sample.x}%` }}
          />
        </>
      ) : null}
    </div>
  );
}

export function TravelPageClient({
  destinations,
  travelStats,
  showPinGrid = false,
}: TravelPageClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sample, setSample] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    const handleResize = () => {
      setDimensions({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(el);
    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleGridClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!showPinGrid || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const next = screenToImagePercent(
        dimensions.width,
        dimensions.height,
        event.clientX,
        event.clientY,
        rect.left,
        rect.top
      );
      setSample(next);
      setCopied(false);
      void navigator.clipboard.writeText(`${next.x}, ${next.y}`).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      });
    },
    [showPinGrid, dimensions.width, dimensions.height]
  );

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#eaeaea] font-body selection:bg-accent/30 selection:text-white">
      <section className="relative w-full h-[95vh] min-h-[750px] flex flex-col justify-between px-6 py-12 md:p-16 overflow-hidden border-b border-[#141414]">
        <div
          ref={mapRef}
          className="absolute inset-0 z-0 opacity-[0.55] mix-blend-screen pointer-events-none select-none"
        >
          <Image
            src="/images/travel/world-map-dark.jpg"
            alt=""
            fill
            className="object-cover object-[28%_50%] filter sepia-[0.3] brightness-[0.72] contrast-[1.12]"
            priority
          />
        </div>

        {/* Soft wash behind copy — kept narrow so eastern NA pins stay clear */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[min(22rem,32%)] z-10 bg-gradient-to-r from-[#0b0a09] via-[#0b0a09]/55 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-12 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(11,10,9,0.45)_100%)] pointer-events-none" />

        {showPinGrid ? (
          <>
            <div
              className="absolute inset-0 z-[32] cursor-crosshair"
              onClick={handleGridClick}
              role="presentation"
            />
            <div className="absolute inset-0 z-[33] pointer-events-none">
              <PinGridOverlay
                width={dimensions.width}
                height={dimensions.height}
                sample={sample}
              />
            </div>
            <div className="absolute top-6 right-6 z-40 max-w-xs rounded border border-[#e6ca65]/30 bg-[#0b0a09]/90 px-3 py-2 font-mono text-[10px] text-[#e6ca65] shadow-lg">
              <p className="uppercase tracking-widest text-[#baa482]">Pin grid</p>
              <p className="mt-1 text-[#eaeaea]/90 normal-case tracking-normal leading-relaxed">
                Click a city → copies <span className="text-[#e6ca65]">X, Y</span> image %.
                Hide: remove <span className="text-[#e6ca65]">?pinGrid=1</span> from the URL.
              </p>
              {sample ? (
                <p className="mt-2 text-sm text-white">
                  {sample.x}, {sample.y}
                  {copied ? (
                    <span className="ml-2 text-[#e6ca65]/80">copied</span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {/* Same box as the map image so pin % stay aligned on resize */}
        <div className="absolute inset-0 z-[38] hidden md:block pointer-events-none">
          {destinations.map((dest) => {
            if (dimensions.width === 0 || dimensions.height === 0) return null;

            const { left: posX, top: posY } = mapPinPosition(
              dimensions.width,
              dimensions.height,
              dest.mapCoordinates.x,
              dest.mapCoordinates.y
            );

            const pinBody = (
              <>
                <div className="relative w-6 h-8 pointer-events-none select-none transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div className="absolute top-2 left-3 w-3 h-6 origin-bottom rotate-[40deg] opacity-75 blur-[1.2px] z-0">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-3.5 bg-black" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-black" />
                  </div>

                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-gradient-to-r from-gray-300 via-white to-gray-400 border-[0.5px] border-black/20 z-10">
                    <div className="absolute -bottom-[2.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[0.75px] border-l-transparent border-r-[0.75px] border-r-transparent border-t-[3px] border-t-gray-400" />
                  </div>

                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#8a6f30] via-[#4a3b16] to-[#1c1607] border border-black/50 shadow-[0_1.5px_3px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center">
                    <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-[#9c761c] via-[#e6ca65] to-[#fffdf5] shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] relative">
                      <div className="absolute top-[15%] left-[15%] w-0.5 h-0.5 rounded-full bg-white/90" />
                    </div>
                  </div>

                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#e6ca65]/5 border border-[#e6ca65]/10 scale-50 opacity-0 -z-10 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100 mix-blend-screen" />
                </div>

                <span className="absolute top-8 font-serif italic text-[11px] text-[#baa482]/80 whitespace-nowrap tracking-wider pointer-events-none select-none transition-all duration-300 group-hover:text-[#e6ca65] group-hover:translate-y-[0.5px] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                  {dest.title.split(",")[0]}
                </span>
              </>
            );

            return dest.hasDetail ? (
              <Link
                key={`pin-${dest.id}`}
                href={`/travel/${dest.id}`}
                className="absolute group flex flex-col items-center pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-8"
                style={{ top: `${posY}px`, left: `${posX}px` }}
              >
                {pinBody}
              </Link>
            ) : (
              <div
                key={`pin-${dest.id}`}
                className="absolute group flex flex-col items-center pointer-events-auto cursor-default -translate-x-1/2 -translate-y-8 opacity-70"
                style={{ top: `${posY}px`, left: `${posX}px` }}
                title={`${dest.title} — trip page coming soon`}
              >
                {pinBody}
              </div>
            );
          })}
        </div>

        <div className="absolute top-6 left-6 z-40">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors duration-200 font-medium"
          >
            ← Workbench
          </Link>
        </div>

        {/* Sit above the mid-lat pin belt so Canada/USA aren’t covered */}
        <div className="relative z-20 max-w-[18rem] sm:max-w-xs mt-10 md:mt-12 space-y-4 pointer-events-none">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
            Travel
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight leading-[1.15] text-white">
            Places I’ve been.<br />
            Stories I’m <span className="font-serif italic text-accent font-normal">carrying.</span>
          </h1>
          <p className="text-foreground-muted text-sm leading-relaxed max-w-[16rem]">
            A map of chapters—each place leaving its mark, each journey shaping how I see the world.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="#destinations-grid"
              className="inline-flex items-center gap-3 border border-[#262626] bg-[#111111]/40 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide text-foreground-subtle hover:border-[#3a3a3a] hover:text-white hover:bg-[#141414] transition-all group pointer-events-auto"
            >
              Browse Destinations
              <span className="transform group-hover:translate-x-0.5 transition-transform">↓</span>
            </Link>
            <Link
              href="/gallery/travel"
              className="inline-flex items-center gap-3 border border-[#262626] bg-[#111111]/40 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide text-foreground-subtle hover:border-[#3a3a3a] hover:text-white hover:bg-[#141414] transition-all group pointer-events-auto"
            >
              Browse Gallery
              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        <div className="relative z-20 max-w-5xl w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 mt-16 pt-8 border-t border-[#141414]/40 pointer-events-none">
          {[
            { value: travelStats.places, label: "Places" },
            { value: travelStats.photos, label: "Photos" },
            { value: travelStats.notes, label: "Days" },
            { value: travelStats.memories, label: "Memories" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-2xl font-light text-white tracking-tight">{stat.value}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="destinations-grid" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="flex justify-between items-end border-b border-[#141414] pb-4 mb-8">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Destinations
          </h2>
          <span className="font-mono text-[10px] text-foreground-muted">Most recent</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => {
            const cardClassName =
              "relative aspect-[4/3] w-full block rounded-md border border-[#141414] bg-[#0c0c0c] overflow-hidden group transition-all duration-500";
            const cardInner = (
              <>
                <div className="absolute inset-0 z-0 transform scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out">
                  <Image
                    src={dest.imageSrc}
                    alt={dest.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    // Already compressed JPGs / R2 webps — avoid CF Images Worker spikes (1102).
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                </div>

                <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-start justify-end gap-3">
                    {!dest.hasDetail ? (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
                        Coming soon
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display text-xl text-white font-medium tracking-wide group-hover:text-accent transition-colors duration-300">
                      {dest.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[9px] text-foreground-muted uppercase tracking-wider">
                      <span className="text-[10px] lowercase text-foreground-subtle group-hover:text-white transition-colors">
                        {dest.date}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );

            return dest.hasDetail ? (
              <Link
                key={dest.id}
                href={`/travel/${dest.id}`}
                className={`${cardClassName} hover:border-[#262626] cursor-pointer`}
              >
                {cardInner}
              </Link>
            ) : (
              <div
                key={dest.id}
                className={`${cardClassName} cursor-default opacity-80`}
                aria-disabled
              >
                {cardInner}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="w-full max-w-4xl mx-auto px-6 pb-24 pt-12 flex flex-col items-center text-center space-y-4">
        <p className="font-serif italic text-lg text-foreground-muted max-w-md leading-relaxed">
          “We travel not to escape life, but for life not to escape us.”
        </p>
        <span className="font-mono text-[9px] uppercase tracking-widest text-accent/60">
          — Unknown
        </span>
      </footer>
    </main>
  );
}
