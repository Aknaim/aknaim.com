import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClimbingProgression } from "@/components/sections/climbing/ClimbingProgression";
import { InterestGearList } from "@/components/sections/InterestGearList";
import {
  getClimbingGalleryHref,
  getClimbingGearItems,
  getClimbingProgressionBundle,
  getClimbingStats,
} from "@/lib/db/queries/climbing";

export const metadata: Metadata = {
  title: "Climbing",
};

/** Cache HTML briefly — stats/progression don't need per-request freshness. */
export const revalidate = 60;

export default async function ClimbingPage() {
  const [climbingStats, climbingGearItems, { timeline: progressionTimeline, currentLevel }] =
    await Promise.all([
      getClimbingStats(),
      getClimbingGearItems(),
      getClimbingProgressionBundle(),
    ]);

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <section className="relative border-b border-[#141414]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-3">
              <span className="text-eyebrow tracking-[0.25em] text-accent/80 block">
                Climbing
              </span>
              <h1 className="font-display text-5xl sm:text-6xl font-medium tracking-tight leading-[1.15] text-white">
                Heights I&apos;m still{" "}
                <span className="font-serif italic text-accent font-normal">chasing.</span>
              </h1>
              <p className="font-display text-xl text-accent tracking-wide border-b border-accent/30 pb-3 inline-block">
                Max Grades {currentLevel ?? "—"}
              </p>
              <p className="text-foreground-muted text-base leading-relaxed max-w-sm">
                Gravity, on purpose.
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
                  <span className="text-eyebrow text-foreground-muted">
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
        <div className="space-y-6">
          <h2 className="text-eyebrow text-foreground-muted">
            Progression
          </h2>
          <ClimbingProgression timeline={progressionTimeline} />
        </div>

        <InterestGearList items={climbingGearItems} />
      </section>
    </main>
  );
}
