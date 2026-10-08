import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GamesShelf } from "@/components/sections/video-games/GamesShelf";

export const metadata: Metadata = {
  title: "Video Games",
};

export default function VideoGamesPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <section className="relative border-b border-[#141414]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group"
            >
              <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span>
              Workbench
            </Link>

            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
                Video Games
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.15] text-white">
                Matches I&apos;m still{" "}
                <span className="font-serif italic text-accent font-normal">queueing for.</span>
              </h1>
            </div>

            <nav
              aria-label="On this page"
              className="flex flex-wrap gap-x-5 gap-y-2 pt-2 font-mono text-[10px] uppercase tracking-widest"
            >
              <a href="#shelf" className="text-foreground-muted hover:text-white transition-colors">
                Shelf
              </a>
            </nav>
          </div>

          <div className="relative aspect-[4/3] lg:aspect-square order-1 lg:order-2 rounded-card border border-[#141414] overflow-hidden bg-[#0c0c0c]">
            <Image
              src="/images/hero/peek-video-games.jpg"
              alt="Video games kit"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section id="shelf" className="max-w-7xl mx-auto px-6 py-14 md:py-20 scroll-mt-8">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted mb-6">
          Shelf
        </h2>
        <GamesShelf />
      </section>
    </main>
  );
}
