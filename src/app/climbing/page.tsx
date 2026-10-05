import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InterestGearList } from "@/components/sections/InterestGearList";
import {
  getClimbingCurrentLevel,
  getClimbingGalleryHref,
  getClimbingGearItems,
  getClimbingProgression,
  getClimbingStats,
} from "@/lib/db/queries/climbing";

export const metadata: Metadata = {
  title: "Climbing",
};

export const dynamic = "force-dynamic";

export default async function ClimbingPage() {
  const [climbingStats, climbingGearItems, progressionTimeline, currentLevel] =
    await Promise.all([
      getClimbingStats(),
      getClimbingGearItems(),
      getClimbingProgression(),
      getClimbingCurrentLevel(),
    ]);

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
                Climbing
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white">
                Climbing
              </h1>
              <p className="font-display text-xl text-accent tracking-wide border-b border-accent/30 pb-3 inline-block">
                Max Grades {currentLevel ?? "—"}
              </p>
              <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
                Climbing hard, or hardly climbing.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[#141414]">
              {[
                { value: climbingStats.sessions, label: "Sessions" },
                { value: climbingStats.locations, label: "Locations" },
                { value: climbingStats.routesSent, label: "Routes Sent" },
                { value: climbingStats.outdoorTrips, label: "Outdoor Trips" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-light text-white tracking-tight">{stat.value}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={getClimbingGalleryHref()}
              className="inline-flex items-center gap-3 border border-[#262626] bg-[#111111]/40 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide text-foreground-subtle hover:border-[#3a3a3a] hover:text-white hover:bg-[#141414] transition-all group"
            >
              Browse Sessions
              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          <div className="relative aspect-[3/4] lg:aspect-[4/5] order-1 lg:order-2 rounded-card border border-[#141414] overflow-hidden bg-[#0c0c0c]">
            <Image
              src="/images/hero/hero-climbing.jpg"
              alt="Climbing on a textured rock wall"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-16">
        <div className="space-y-8">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Progression
          </h2>
          {progressionTimeline.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              Milestones appear as you log climbs at 5.11+ and V5+.
            </p>
          ) : (
            <div className="relative flex flex-wrap justify-between gap-6 px-2">
              <div className="absolute top-[5px] left-0 right-0 h-[1px] bg-gradient-to-r from-accent/40 via-[#141414] to-transparent hidden sm:block" />
              {progressionTimeline.map((item) => (
                <div
                  key={`${item.date}-${item.label}`}
                  className="flex flex-col items-start relative min-w-[100px]"
                >
                  <span className="absolute -top-[3px] left-0 h-1.5 w-1.5 rounded-full bg-[#1a1a1a] border border-[#262626] hidden sm:block" />
                  <span className="font-mono text-[9px] text-accent/70 uppercase">
                    {item.dateLabel}
                  </span>
                  <span className="text-[11px] text-foreground-muted font-medium mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <InterestGearList items={climbingGearItems} />
      </section>
    </main>
  );
}
