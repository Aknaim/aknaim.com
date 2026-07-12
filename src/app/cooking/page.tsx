import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InterestGearList } from "@/components/sections/InterestGearList";
import { cookingGearItems, cookingStats, getCookingGalleryHref } from "@/lib/data/recipes";

export const metadata: Metadata = {
  title: "Cooking",
};

export default function CookingPage() {
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
                Cooking
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white">
                Cooking
              </h1>
              <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
                Recipes, experiments, and the final shot.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[#141414]">
              {[
                { value: cookingStats.recipes, label: "Recipes" },
                { value: cookingStats.categories, label: "Categories" },
                { value: cookingStats.cuisines, label: "Cuisines" },
                { value: cookingStats.years, label: "Years" },
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
              href={getCookingGalleryHref()}
              className="inline-flex items-center gap-3 border border-[#262626] bg-[#111111]/40 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide text-foreground-subtle hover:border-[#3a3a3a] hover:text-white hover:bg-[#141414] transition-all group"
            >
              Browse Recipes
              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
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

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <InterestGearList items={cookingGearItems} />
      </section>
    </main>
  );
}
