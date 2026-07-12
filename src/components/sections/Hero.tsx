import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteData } from "@/lib/data";

export function Hero() {
  const { personal } = siteData;

  return (
    <section className="page-container py-10 lg:py-14">
      <h1 className="text-hero max-w-3xl">
        <span className="text-foreground">{personal.headlinePrefix}</span>
        <span className="text-emphasis">{personal.headlineEmphasis}</span>
        <span className="text-foreground">{personal.headlineSuffix}</span>
      </h1>
      <p className="mt-5 max-w-xl text-body text-foreground-muted">
        {personal.bio}
      </p>
      <Link
        href={personal.aboutCta.href}
        className="mt-8 inline-flex items-center gap-2 rounded-pill border border-accent/40 bg-accent/10 px-5 py-2.5 text-body-sm text-accent transition-colors hover:bg-accent/20 hover:text-accent-hover"
      >
        {personal.aboutCta.label}
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </Link>
    </section>
  );
}
