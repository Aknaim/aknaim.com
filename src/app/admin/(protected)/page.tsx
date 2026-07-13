import type { Metadata } from "next";
import Link from "next/link";
import { countGalleryItems } from "@/lib/db/queries/gallery";
import { getCookingStats } from "@/lib/db/queries/recipes";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminHomePage() {
  const [stats, cookingGalleryCount] = await Promise.all([
    getCookingStats(),
    countGalleryItems("cooking"),
  ]);

  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-white">Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-2">
          Manage recipes and gallery content stored in Postgres.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Recipes", value: stats.recipes },
          { label: "Categories", value: stats.categories },
          { label: "Cuisines", value: stats.cuisines },
          { label: "Cooking gallery", value: cookingGalleryCount },
        ].map((item) => (
          <div key={item.label} className="border border-[#141414] bg-[#0c0c0c] p-4">
            <div className="text-2xl text-white font-light">{item.value}</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/admin/recipes"
        className="inline-flex items-center gap-2 border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-foreground-subtle hover:text-white hover:border-accent transition-colors"
      >
        Manage recipes →
      </Link>
    </main>
  );
}
