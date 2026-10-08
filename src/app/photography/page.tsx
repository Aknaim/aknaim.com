import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoursesList } from "@/components/sections/CoursesList";
import { InterestGearList } from "@/components/sections/InterestGearList";
import { getCoursesForInterest } from "@/lib/db/queries/courses";
import { PHOTOGRAPHY_GEAR } from "@/lib/photography/gear";

export const metadata: Metadata = {
  title: "Photography",
};

export const revalidate = 3600;

export default async function PhotographyPage() {
  const courses = await getCoursesForInterest("photography");

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <section className="relative border-b border-[#141414]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group"
            >
              <span className="transform group-hover:-translate-x-0.5 transition-transform">
                ←
              </span>
              Workbench
            </Link>

            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
                Photography
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.15] text-white">
                Light I&apos;m still{" "}
                <span className="font-serif italic text-accent font-normal">chasing.</span>
              </h1>
              <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
                Exposure, composition, and the frame that finally sticks.
              </p>
            </div>

            <nav
              aria-label="On this page"
              className="flex flex-wrap gap-x-5 gap-y-2 pt-2 font-mono text-[10px] uppercase tracking-widest"
            >
              <a href="#courses" className="text-foreground-muted hover:text-white transition-colors">
                Courses
              </a>
              <a href="#gear" className="text-foreground-muted hover:text-white transition-colors">
                Gear
              </a>
            </nav>
          </div>

          <div className="relative aspect-[3/4] lg:aspect-[4/5] order-1 lg:order-2 rounded-card border border-[#141414] overflow-hidden bg-[#0c0c0c]">
            <Image
              src="/images/hero/hero-photography.jpg"
              alt="Atmospheric photography scene"
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
        <CoursesList courses={courses} heading="Courses" />
        <InterestGearList items={PHOTOGRAPHY_GEAR} />
      </section>
    </main>
  );
}
