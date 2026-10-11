import Link from "next/link";
import { siteData } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="page-container border-b border-border py-6">
      <nav aria-label="Primary">
        <Link
          href="/"
          className="font-display text-body-sm tracking-wide text-foreground"
        >
          {siteData.personal.name}
        </Link>
      </nav>
    </header>
  );
}
