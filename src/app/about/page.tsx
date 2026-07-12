import { siteData } from "@/lib/data";

export default function AboutPage() {
  const { personal, skills } = siteData;

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16 px-6 sm:px-12 max-w-6xl mx-auto font-body">
      {/* Page Header */}
      <header className="mb-16 border-b border-[#1f1f1f] pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2 block">
          Introduction
        </span>
        <h1 className="text-hero font-display text-4xl sm:text-5xl font-medium tracking-tight">
          About <span className="text-emphasis italic">Me</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Human Narrative */}
        <section className="lg:col-span-7 space-y-6 text-foreground-muted text-body leading-relaxed">
          <p className="text-foreground text-lg font-medium leading-relaxed">
            I appreciate things that require patience, focus, and deliberate execution. 
          </p>
          <p>
            Whether I’m mapping out a problem on a screen, working through a technical move on a climbing wall, or waiting on a slow dough fermentation, I like understanding how the pieces fit together. For me, the joy isn't just in finishing something, but in the rhythm of figuring it out.
          </p>
          <p>
            When I step away from the desk, my energy usually goes toward a few specific creative side-quests. I spend my time projecting vertical lines indoors and out, experimenting with high-heat outdoor baking profiles, and capturing landscape or travel compositions through a manual prime lens. 
          </p>
          <p>
            This space serves as a central log for those pursuits—a quiet, tactile archive of things built, explored, cooked, and studied.
          </p>
        </section>

        {/* Right Column: Focus Areas & Skills */}
        <section className="lg:col-span-5 bg-[#111111]/40 border border-[#141414] rounded-card p-6 h-fit">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6 border-b border-[#1f1f1f] pb-3">
            Focus Areas
          </h2>
          
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between border-b border-[#141414]/40 pb-2 last:border-0">
                <div className="flex flex-col">
                  <span className="text-body-sm font-medium text-foreground">
                    {skill.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase text-foreground-muted tracking-wider mt-0.5">
                    {skill.category}
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-pill bg-[#141414] border border-[#262626] text-foreground-subtle tracking-tight">
                  {skill.proficiency}
                </span>
              </div>
            ))}
          </div>

          {/* Contact Meta */}
          <div className="mt-8 pt-6 border-t border-[#1f1f1f] flex flex-col space-y-2 font-mono text-xs text-foreground-muted">
            <div className="flex justify-between items-center">
              <span>Location:</span>
              <span className="text-foreground">{personal.location}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span>Say Hello:</span>
              <a href={`mailto:${personal.email}`} className="text-foreground hover:text-accent transition-colors">
                {personal.email}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}