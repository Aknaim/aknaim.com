import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TripMomentsGrid } from "@/components/sections/travel/TripMomentsGrid";
import { getTripById, getTripGalleryHref, getTripIds } from "@/lib/db/queries/travel";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const ids = await getTripIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: TripDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTripById(id);
  if (!trip) return { title: "Trip Not Found" };
  return { title: trip.country };
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const trip = await getTripById(id);

  if (!trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <section className="relative w-full h-[70vh] min-h-[550px] flex flex-col justify-between p-6 md:p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={trip.heroImage}
            alt={trip.country}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a09] via-[#0b0a09]/35 to-black/45" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto mt-12">
          <Link
            href="/travel"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/90 hover:text-white transition-colors group drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          >
            <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Back to Map
          </Link>
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto space-y-4 mb-4">
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight text-white">
            {trip.country}
          </h1>
          <p className="font-serif italic text-sm text-accent tracking-wide">{trip.date}</p>
          <p className="text-foreground-muted text-sm max-w-md leading-relaxed">{trip.summary}</p>

          {Object.values(trip.stats).some((val) => Number(val) > 0) ? (
            <div className="flex gap-8 md:gap-12 pt-6 border-t border-white/10 max-w-xl">
              {Object.entries(trip.stats)
                .filter(([, val]) => Number(val) > 0)
                .map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xl font-light text-white tracking-tight">{val}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mt-0.5">
                      {key}
                    </span>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </section>

      {(() => {
        const heroBase = trip.heroImage.split("?")[0];
        const mapBase = trip.route.mapImage.split("?")[0];
        const hasDedicatedMap = Boolean(mapBase && mapBase !== heroBase);
        const showRoute =
          hasDedicatedMap || trip.route.stops.length > 0 || Boolean(trip.route.note);
        if (!showRoute) return null;
        return (
          <section className="max-w-7xl mx-auto px-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {hasDedicatedMap ? (
                <div className="lg:col-span-7 relative w-full aspect-[16/10] rounded border border-[#2a2620] overflow-hidden bg-[#141210]">
                  <Image
                    src={trip.route.mapImage}
                    alt="Route Map"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                </div>
              ) : null}

              <div className={hasDedicatedMap ? "lg:col-span-5 space-y-4" : "lg:col-span-12 space-y-4"}>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent">
                  The Route
                </span>
                {trip.route.stops.length > 0 ? (
                  <div className="text-xl font-display font-light text-white tracking-wide leading-relaxed">
                    {trip.route.stops.map((s) => s.name).join(" → ")}
                  </div>
                ) : null}
                {trip.route.note ? (
                  <p className="font-serif italic text-xs text-foreground-muted max-w-sm leading-relaxed pt-2 border-t border-[#26221c]">
                    {trip.route.note}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        );
      })()}

      {trip.moments.length > 0 ? (
        <section className="max-w-7xl mx-auto px-6 mt-16 md:mt-24 pb-24">
          <div className="flex justify-between items-end border-b border-[#141414] pb-3 mb-6">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              Moments Along the Way
            </h2>
            <Link
              href={getTripGalleryHref(trip.id)}
              className="font-mono text-[10px] text-foreground-subtle hover:text-accent transition-colors"
            >
              View all photos →
            </Link>
          </div>
          <TripMomentsGrid moments={trip.moments} country={trip.country} />
          <div className="mt-10 flex justify-center">
            <Link
              href={getTripGalleryHref(trip.id)}
              className="inline-flex items-center gap-2 border border-[#262626] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:border-accent hover:text-white transition-colors"
            >
              Open full gallery
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-6 mt-16 md:mt-24 pb-24">
          <div className="flex justify-center">
            <Link
              href={getTripGalleryHref(trip.id)}
              className="inline-flex items-center gap-2 border border-[#262626] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:border-accent hover:text-white transition-colors"
            >
              Open full gallery
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
