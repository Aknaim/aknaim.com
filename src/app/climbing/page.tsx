import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InterestGearList } from "@/components/sections/InterestGearList";
import {
  climbingGearItems,
  climbingProjects,
  climbingStats,
  getClimbingGalleryHref,
  progressionTimeline,
  STATUS_LABELS,
} from "@/lib/climbingData";

export const metadata: Metadata = {
  title: "Climbing",
};

export default function ClimbingPage() {
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
                Current Level 5.12+
              </p>
              <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
                Always learning. Always climbing.
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
        <div className="space-y-6">
          <div className="border-b border-[#141414] pb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              Current Projects
            </h2>
          </div>
          <ul className="space-y-3">
            {climbingProjects.map((project) => (
              <li
                key={project.id}
                className="flex gap-4 rounded-card border border-[#141414] bg-[#0c0c0c] p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-image border border-[#1a1a1a]">
                  <Image
                    src={project.imageSrc}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="text-sm text-white font-medium truncate">
                    {project.grade} · {project.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mt-1">
                    {project.location}
                  </span>
                </div>
                <span
                  className={`self-center shrink-0 font-mono text-[8px] uppercase tracking-wider px-2 py-1 rounded border ${
                    project.status === "in-progress"
                      ? "text-accent border-accent/30 bg-accent/5"
                      : project.status === "projecting"
                        ? "text-foreground-muted border-[#262626] bg-[#141414]"
                        : "text-foreground-subtle border-[#1a1a1a]"
                  }`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <InterestGearList items={climbingGearItems} />
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="border-t border-[#141414] pt-10">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted mb-8">
            Progression
          </h2>
          <div className="relative flex flex-wrap justify-between gap-6 px-2">
            <div className="absolute top-[5px] left-0 right-0 h-[1px] bg-gradient-to-r from-accent/40 via-[#141414] to-transparent hidden sm:block" />
            {progressionTimeline.map((milestone) => (
              <div key={milestone.year} className="flex flex-col items-start relative min-w-[100px]">
                <span className="absolute -top-[3px] left-0 h-1.5 w-1.5 rounded-full bg-[#1a1a1a] border border-[#262626] hidden sm:block" />
                <span className="font-mono text-[9px] text-accent/70 uppercase">{milestone.year}</span>
                <span className="text-[11px] text-foreground-muted font-medium mt-0.5">{milestone.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
