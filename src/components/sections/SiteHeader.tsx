import Link from "next/link";
import { siteData } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="page-container border-b border-border py-6">
      <nav
        className="flex items-center justify-between gap-6"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="font-display text-body-sm tracking-wide text-foreground"
        >
          {siteData.personal.name}
        </Link>
        <ul className="flex flex-wrap items-center gap-6">
          {siteData.navigation.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="text-body-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
