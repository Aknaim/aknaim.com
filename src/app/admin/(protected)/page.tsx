import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
};

/**
 * No DB on this page — Workers Error 1102 was triggered by loading
 * full climbs/recipes just to show dashboard counts.
 */
export default function AdminHomePage() {
  const sections = [
    {
      href: "/admin/travel",
      label: "Travel",
      description: "Destinations, trips, and trip photos.",
    },
    {
      href: "/admin/climbing",
      label: "Climbing",
      description: "Climbs and session media.",
    },
    {
      href: "/admin/recipes",
      label: "Cooking",
      description: "Recipes and cooking gallery.",
    },
  ] as const;

  return (
    <main className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-light text-white">Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-2">
          Manage site sections first. Gallery and media are shared library tools.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Site sections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="border border-[#141414] bg-[#0c0c0c] p-5 hover:border-accent/40 transition-colors group"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl font-light text-white group-hover:text-accent transition-colors">
                  {section.label}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle">
                  Open →
                </span>
              </div>
              <p className="text-sm text-foreground-muted mt-2">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Library
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/gallery"
            className="border border-[#141414] bg-[#0c0c0c] p-4 hover:border-accent/40 transition-colors"
          >
            <div className="text-sm text-white">Gallery</div>
            <p className="text-xs text-foreground-muted mt-1">
              Cross-section photo/video items
            </p>
          </Link>
          <Link
            href="/admin/media"
            className="border border-[#141414] bg-[#0c0c0c] p-4 hover:border-accent/40 transition-colors"
          >
            <div className="text-sm text-white">Media</div>
            <p className="text-xs text-foreground-muted mt-1">R2 uploads library</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
