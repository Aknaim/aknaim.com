import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoursesList } from "@/components/sections/CoursesList";
import { InterestGearList } from "@/components/sections/InterestGearList";
import { getCoursesForInterest } from "@/lib/db/queries/courses";
import {
  getCookingGalleryHref,
  getCookingGearItems,
  getCookingStats,
} from "@/lib/db/queries/recipes";

export const metadata: Metadata = {
  title: "Cooking",
};

export const revalidate = 60;

export default async function CookingPage() {
  const [cookingStats, cookingGearItems, courses] = await Promise.all([
    getCookingStats(),
    getCookingGearItems(),
    getCoursesForInterest("cooking"),
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
              <span className="transform group-hover:-translate-x-0.5 transition-transform">
                ←
              </span>
              Workbench
            </Link>

            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
                Cooking
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.15] text-white">
                Flavours I&apos;m still{" "}
                <span className="font-serif italic text-accent font-normal">craving.</span>
              </h1>
              <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
                Continuing-ed kitchens, sharp knives, and the dish that earns a remake.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[#141414]">
              {[
                { value: cookingStats.recipes, label: "Recipes" },
                { value: cookingStats.categories, label: "Categories" },
                { value: cookingStats.cuisines, label: "Cuisines" },
                { value: String(courses.length), label: "Courses" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-light text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
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
              <a
                href={getCookingGalleryHref()}
                className="text-foreground-muted hover:text-white transition-colors"
              >
                Gallery
              </a>
            </nav>
          </div>

          <div className="relative aspect-[4/3] lg:aspect-square order-1 lg:order-2 rounded-card border border-[#141414] overflow-hidden bg-[#0c0c0c]">
            <Image
              src="/images/hero/peek-cooking.jpg"
              alt="Wood-fired pizza on a dark wooden surface"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-16">
        <CoursesList
          courses={courses}
          heading="Continuing education · George Brown"
        />
        <InterestGearList items={cookingGearItems} heading="Gear & Equipment" />
      </section>
    </main>
  );
}
