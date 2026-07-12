import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { omanTripData } from "@/lib/data/trips/oman";
import { getTripGalleryHref } from "@/lib/data/galleries/travelGalleryData";

const tripsMap: Record<string, typeof omanTripData> = {
  oman: omanTripData,
  // Add future trip data blocks here (e.g. japan: japanTripData)
};

// 1. Mark the page component function as async
export default async function TripDetailPage({
  params
}: {
  params: Promise<{ id: string }> // 2. Update type definition to expect a Promise
}) {

  // 3. Explicitly unwrap the params Promise using await
  const { id } = await params;

  // 4. Use the unwrapped id variable to check your map data safely
  const trip = tripsMap[id];

  if (!trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">

      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative w-full h-[70vh] min-h-[550px] flex flex-col justify-between p-6 md:p-16 overflow-hidden">
        <div className="absolute inset-0 z-0 brightness-[0.45] contrast-[1.05]">
          <Image src={trip.heroImage} alt={trip.country} fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto mt-12">
          <Link href="/travel" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group">
            <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Back to Map
          </Link>
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto space-y-4 mb-4">
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight text-white">{trip.country}</h1>
          <p className="font-serif italic text-sm text-accent tracking-wide">{trip.date}</p>
          <p className="text-foreground-muted text-sm max-w-md leading-relaxed">{trip.summary}</p>

          {/* Quick Counter Row */}
          <div className="flex gap-8 md:gap-12 pt-6 border-t border-white/10 max-w-xl">
            {Object.entries(trip.stats).map(([key, val]) => (
              <div key={key} className="flex flex-col">
                <span className="text-xl font-light text-white tracking-tight">{val}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted mt-0.5">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LOCAL ROUTE CANVAS & PROGRESS BAR MAP BLOCK */}
      <section className="max-w-7xl mx-auto px-6 mt-4">
        <div className="bg-[#0c0c0c] border border-[#141414] rounded-card p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Localized Map Graphic */}
          <div className="lg:col-span-7 relative aspect-[16/9] bg-[#090909] rounded border border-[#1a1a1a] overflow-hidden opacity-[0.4] mix-blend-luminosity">
            <Image src={trip.route.mapImage} alt="Route Map" fill className="object-cover" />
            {trip.route.stops.map((stop, index) => (
              <div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                style={{ left: `${stop.coordinates.x}%`, top: `${stop.coordinates.y}%` }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent relative ring-2 ring-[#070707]" />
                <span className="absolute top-3 font-serif italic text-[10px] text-foreground-muted/60 whitespace-nowrap">{stop.name}</span>
              </div>
            ))}
          </div>

          {/* Route Text Readout Description Layout */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent">The Route</span>
            <div className="text-xl font-display font-light text-white tracking-wide leading-relaxed">
              {trip.route.stops.map(s => s.name).join(" → ")}
            </div>
            <p className="font-serif italic text-xs text-foreground-muted max-w-sm leading-relaxed pt-2 border-t border-[#141414]">
              A loop through contrast. Mountains to desert. Old roads and open spaces. Plenty of chai.
            </p>
          </div>
        </div>

        {/* Dynamic Horizontal Chrono-Slider Node Line */}
        <div className="relative w-full flex justify-between items-center mt-12 px-4 border-t border-[#141414] pt-8">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-accent/40 via-[#141414] to-transparent" />
          {trip.timeline.map((node, i) => (
            <div key={i} className="flex flex-col items-start relative">
              <span className="absolute -top-[36px] left-0 h-1.5 w-1.5 rounded-full bg-[#1a1a1a] border border-[#262626] transition-colors duration-300 hover:bg-accent" />
              <span className="font-mono text-[9px] text-accent/60 uppercase">{node.day}</span>
              <span className="text-[11px] text-foreground-muted font-medium mt-0.5">{node.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MOMENTS ALONG THE WAY GALLERY DECK */}
      <section className="max-w-7xl mx-auto px-6 mt-16 md:mt-24">
        <div className="flex justify-between items-end border-b border-[#141414] pb-3 mb-6">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">Moments Along the Way</h2>
          <Link
            href={getTripGalleryHref(trip.id)}
            className="font-mono text-[10px] text-foreground-subtle hover:text-accent transition-colors"
          >
            View all photos →
          </Link>
          {/* <span className="font-mono text-[10px] text-foreground-subtle hover:text-white transition-colors cursor-pointer">View all photos →</span> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trip.moments.map((moment, idx) => (
            <div key={idx} className="relative aspect-[4/3] rounded border border-[#141414] bg-[#0c0c0c] overflow-hidden group">
              <Image src={moment.imageSrc} alt={moment.title} fill className="object-cover filter brightness-[0.5] group-hover:brightness-[0.75] mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 scale-100 group-hover:scale-105" />
              <div className="absolute inset-0 p-4 flex justify-between items-end bg-gradient-to-t from-[#070707]/80 via-transparent to-transparent">
                <span className="text-xs text-white font-medium tracking-wide">{moment.title}</span>
                <span className="font-mono text-[9px] text-foreground-muted">📁 {moment.photoCount}</span>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="mt-8 flex justify-center">
          <Link
            href={getTripGalleryHref(trip.id)}
            className="inline-flex items-center gap-2 border border-[#262626] bg-[#111111]/40 px-6 py-3 rounded-full text-xs font-medium tracking-wide text-foreground-subtle hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all group"
          >
            View All Photos from {trip.country}
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div> */}
      </section>

      {/* 4. CONTENT ARCHIVE BENTO COMPLEX GRID */}
      <section className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Field Notes Column Segment */}
        <div className="lg:col-span-4 bg-[#0c0c0c] border border-[#141414] rounded-card p-5 space-y-4">
          <h3 className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted border-b border-[#141414] pb-2">Field Notes</h3>
          <ul className="space-y-4 font-serif italic text-xs text-foreground-muted leading-relaxed">
            {trip.fieldNotes.map((note, nIdx) => (
              <li key={nIdx} className="flex gap-2 items-start">
                <span className="text-accent/50 text-[10px] mt-0.5">✒️</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Favorite Meals & Local Spot Matrix Component */}
        <div className="lg:col-span-5 bg-[#0c0c0c] border border-[#141414] rounded-card p-5 space-y-4">
          <h3 className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted border-b border-[#141414] pb-2">Favorite Meals & Places</h3>
          <div className="grid grid-cols-3 gap-2">
            {trip.favoritePlaces.map((place, pIdx) => (
              <div key={pIdx} className="flex flex-col space-y-1.5 group cursor-pointer">
                <div className="relative aspect-[4/5] rounded border border-[#1f1f1f] overflow-hidden bg-[#090909]">
                  <Image src={place.imageSrc} alt={place.title} fill className="object-cover filter brightness-[0.4] group-hover:brightness-[0.7] transition-all duration-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white font-medium truncate tracking-tight">{place.title}</span>
                  <span className="font-mono text-[8px] text-foreground-subtle truncate uppercase mt-0.5">{place.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Gear Flatlay Visual Component Block */}
        <div className="lg:col-span-3 bg-[#0c0c0c] border border-[#141414] rounded-card p-5 flex flex-col justify-between">
          <h3 className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted border-b border-[#141414] pb-2 mb-3">Gear & Essentials</h3>
          <div className="relative w-full h-full min-h-[160px] rounded border border-[#1a1a1a] overflow-hidden opacity-40 hover:opacity-70 transition-opacity duration-500">
            <Image src={trip.gearImage} alt="Travel Gear Flatlay" fill className="object-cover mix-blend-luminosity" />
          </div>
        </div>

      </section>

      {/* 5. FOOTER LONG-FORM EDITORIAL REFLECTION BLOCK */}
      <footer className="max-w-7xl mx-auto px-6 mt-4">
        <div className="bg-[#0c0c0c] border border-[#141414] rounded-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 relative aspect-[16/10] bg-[#090909] rounded border border-[#1a1a1a] overflow-hidden opacity-30">
            {/* Dark stylized notebook asset image block */}
            <Image src="/images/travel/journal-footer-bg.jpg" alt="" fill className="object-cover" />
          </div>
          <div className="md:col-span-8 space-y-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent">Journal Reflection</span>
            <blockquote className="font-display text-2xl font-light text-white tracking-wide leading-snug">
              “{trip.reflection.excerpt}”
            </blockquote>
            <Link href={`/journal/${trip.reflection.slug}`} className="inline-flex items-center gap-1.5 font-mono text-[10px] text-foreground-muted hover:text-accent transition-colors pt-2 group">
              Read the full reflection <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}