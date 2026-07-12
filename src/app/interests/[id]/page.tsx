import { notFound } from "next/navigation";
import Link from "next/link";
import { getIcon } from "@/lib/icon-map";
import { siteData } from "@/lib/data";
import { InterestTabsContainer } from "@/components/sections/InterestTabsContainer"; 

interface InterestPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterestPage({ params }: InterestPageProps) {
  const { id } = await params;

  // 1. Look up the specific interest from your local static data array
  const interest = siteData.interests.find((item) => item.id === id);

  // 2. Trigger a 404 if a user manually inputs an unrecognized interest ID in the URL
  if (!interest) return notFound();

  const Icon = getIcon(interest.icon);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground font-sans antialiased">
      
      {/* Cinematic Hero Header Panel */}
      <div className="relative h-[45vh] w-full overflow-hidden border-b border-[#141414]">
        {/* Desaturated background asset matching your visual aesthetic */}
        <img 
          src={interest.heroImage} 
          alt={interest.label} 
          className="h-full w-full object-cover opacity-40 mix-blend-luminosity scale-[1.01]"
        />
        {/* Soft radial and linear overlays to anchor text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Back Navigation Trigger */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            href="/" 
            className="text-[11px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors duration-200 font-medium"
          >
            ← Workbench
          </Link>
        </div>

        {/* Text Metadata Overlay Block */}
        <div className="absolute bottom-8 left-0 w-full px-6 sm:px-12 max-w-5xl mx-auto z-10">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-3.5 w-3.5 text-accent/90" strokeWidth={1.5} aria-hidden />
            <span className="text-[10px] text-accent uppercase tracking-widest font-medium">
              Home / {interest.label}
            </span>
          </div>
          
          <h1 className="font-display text-4xl font-medium tracking-tight text-white sm:text-5xl">
            {interest.label}
          </h1>
          
          <p className="mt-2.5 max-w-md text-xs text-foreground-subtle leading-relaxed">
            {interest.tagline}
          </p>
        </div>
      </div>

      {/* Dynamic Content Columns Panel Area */}
      <section className="max-w-5xl mx-auto px-6 sm:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          
          {/* Left Column: Interactive Tab Sub-navigation List */}
          <div className="w-full">
            <InterestTabsContainer tabs={interest.tabs} />
          </div>

          {/* Right Column: Context Note Panel Card */}
          {interest.workbenchNote && (
            <aside className="rounded-card border border-[#1f1f1f] bg-[#111111]/30 p-5 backdrop-blur-xs lg:mt-12">
              <h2 className="text-[10px] uppercase tracking-widest text-accent font-medium mb-2">
                Status Note
              </h2>
              <p className="text-xs text-foreground-subtle leading-relaxed italic">
                "{interest.workbenchNote}"
              </p>
            </aside>
          )}

        </div>
      </section>
    </main>
  );
}