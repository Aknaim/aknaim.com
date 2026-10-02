import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteData } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hi, I'm Akbar — a software engineer based in Canada. This site is where I share software, travel, photography, climbing, and recipes.",
};

export default function AboutPage() {
  const { personal } = siteData;

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body selection:bg-accent/30 selection:text-white">
      <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-16 pb-16 md:pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group mb-10 md:mb-14"
        >
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span>
          Workbench
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 lg:items-center">
          <figure className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-image border border-[#141414] bg-[#0c0c0c]">
              <Image
                src="/images/hero/kelso.jpg"
                alt="Akbar at Kelso, Ontario — autumn overlook"
                fill
                priority
                className="object-cover object-[50%_28%]"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <figcaption className="mt-3 font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
              Kelso · Ontario
            </figcaption>
          </figure>

          <article className="lg:col-span-7 space-y-8">
            <header className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
                About Me
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white">
                Hi, I&apos;m{" "}
                <span className="italic text-accent">Akbar</span>.
              </h1>
            </header>

            <div className="space-y-5 text-foreground-muted text-sm sm:text-[15px] leading-[1.85] max-w-xl">
              <p>
                I&apos;m a software engineer based in Canada with an interest in
                backend development, cloud infrastructure, and platform
                engineering.
              </p>
              <p>
                When I&apos;m away from my computer, you&apos;ll probably find me
                climbing, experimenting in the kitchen, planning my next trip, or
                carrying a camera around somewhere new.
              </p>
              <p>
                I built this site as a place to share the things I
                enjoy—software projects, travel, photography, climbing, recipes,
                and anything else I think is worth documenting.
              </p>
            </div>
          </article>
        </div>
      </section>

      <footer className="border-t border-[#141414]">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
              Based in
            </p>
            <p className="text-sm text-white">{personal.location}</p>
          </div>
          <div className="lg:col-span-4 space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
              Say hello
            </p>
            <a
              href={`mailto:${personal.email}`}
              className="text-sm text-white hover:text-accent transition-colors"
            >
              {personal.email}
            </a>
          </div>
          <div className="lg:col-span-3 flex gap-5 sm:justify-end items-end">
            {personal.social
              .filter((link) => link.platform !== "email")
              .map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
