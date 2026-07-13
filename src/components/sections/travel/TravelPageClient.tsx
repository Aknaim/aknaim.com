'use client';

import { useEffect, useState, useRef } from "react";
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
}

export function TravelPageClient({ destinations, travelStats }: TravelPageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#eaeaea] font-body selection:bg-accent/30 selection:text-white">
      <section
        ref={containerRef}
        className="relative w-full h-[95vh] min-h-[750px] flex flex-col justify-between px-6 py-12 md:p-16 overflow-hidden border-b border-[#141414]"
      >
        <div className="absolute inset-0 z-0 opacity-[0.45] mix-blend-screen pointer-events-none select-none">
          <Image
            src="/images/travel/world-map-dark.jpg"
            alt=""
            fill
            className="object-cover object-center filter sepia-[0.35] brightness-[0.55] contrast-[1.15]"
            priority
          />
        </div>

        <div className="absolute inset-y-0 left-0 w-full md:w-[50%] z-10 bg-gradient-to-r from-[#0b0a09] via-[#0b0a09]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-12 bg-radial-gradient from-transparent via-[#0b0a09]/10 to-[#0b0a09] pointer-events-none" />

        <div
          ref={containerRef}
          className="absolute inset-y-0 left-0 w-full md:w-[80%] md:left-[20%] h-full z-30 hidden md:block pointer-events-none"
        >
          {destinations.map((dest) => {
            const IMAGE_NATURAL_WIDTH = 1920;
            const IMAGE_NATURAL_HEIGHT = 1200;

            if (dimensions.width === 0 || dimensions.height === 0) return null;

            const containerRatio = dimensions.width / dimensions.height;
            const imageRatio = IMAGE_NATURAL_WIDTH / IMAGE_NATURAL_HEIGHT;

            let renderedWidth = dimensions.width;
            let renderedHeight = dimensions.height;
            let offsetX = 0;
            let offsetY = 0;

            if (containerRatio > imageRatio) {
              renderedHeight = dimensions.width / imageRatio;
              offsetY = (dimensions.height - renderedHeight) / 2;
            } else {
              renderedWidth = dimensions.height * imageRatio;
              offsetX = (dimensions.width - renderedWidth) / 2;
            }

            const posX = offsetX + (dest.mapCoordinates.x / 100) * renderedWidth;
            const posY = offsetY + (dest.mapCoordinates.y / 100) * renderedHeight;

            return (
              <Link
                key={`pin-${dest.id}`}
                href={`/travel/${dest.id}`}
                className="absolute group flex flex-col items-center pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-8"
                style={{ top: `${posY}px`, left: `${posX}px` }}
              >
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
              </Link>
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

        <div className="relative z-20 max-w-xl mt-12 md:mt-20 space-y-6 pointer-events-none">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
            Travel
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.15] text-white">
            Places I’ve been.<br />
            Stories I’m <span className="font-serif italic text-accent font-normal">carrying.</span>
          </h1>
          <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
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
            { value: travelStats.notes, label: "Notes" },
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
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-foreground-muted">
            <span>Sort by:</span>
            <span className="text-foreground cursor-pointer hover:text-accent transition-colors">
              Recent ↓
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/travel/${dest.id}`}
              className="relative aspect-[4/3] w-full block rounded-md border border-[#141414] bg-[#0c0c0c] overflow-hidden group hover:border-[#262626] transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 z-0 transform scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out filter mix-blend-luminosity brightness-[0.4] group-hover:brightness-[0.55] group-hover:mix-blend-normal">
                <Image
                  src={dest.imageSrc}
                  alt={dest.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent opacity-80" />
              </div>

              <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between pointer-events-none">
                <span className="font-mono text-[10px] text-accent/60 tracking-wider">
                  {dest.number}
                </span>

                <div className="space-y-3">
                  <h3 className="font-display text-xl text-white font-medium tracking-wide group-hover:text-accent transition-colors duration-300">
                    {dest.title}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[9px] text-foreground-muted uppercase tracking-wider">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        🖼️ {dest.photosCount} Photos
                      </span>
                      <span className="flex items-center gap-1">
                        📝 {dest.notesCount} Notes
                      </span>
                    </div>
                    <span className="text-[10px] lowercase text-foreground-subtle group-hover:text-white transition-colors">
                      {dest.date}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
