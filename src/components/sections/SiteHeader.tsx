"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { siteData } from "@/lib/data";
import { getNavCrumbs } from "@/lib/nav-back";

function SiteHeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const crumbs = getNavCrumbs(pathname, searchParams);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[#070707]/85 backdrop-blur-md">
      <nav aria-label="Primary" className="page-container py-3.5 sm:py-4">
        {crumbs ? (
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-eyebrow text-foreground-muted">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <li key={`${crumb.href}-${crumb.label}`} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span className="text-foreground-subtle/70" aria-hidden>
                      /
                    </span>
                  ) : null}
                  <Link
                    href={crumb.href}
                    className={`transition-colors hover:text-white ${
                      index === 0
                        ? "group inline-flex items-center gap-1.5"
                        : isLast
                          ? "text-foreground-muted"
                          : ""
                    }`}
                  >
                    {index === 0 ? (
                      <span className="transition-transform group-hover:-translate-x-0.5">
                        ←
                      </span>
                    ) : null}
                    {crumb.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <Link
            href="/"
            className="font-display text-body-sm tracking-wide text-foreground transition-colors hover:text-white"
          >
            {siteData.personal.name}
          </Link>
        )}
      </nav>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 border-b border-border/80 bg-[#070707]/85 backdrop-blur-md">
          <nav aria-label="Primary" className="page-container py-3.5 sm:py-4">
            <span className="font-display text-body-sm tracking-wide text-foreground">
              {siteData.personal.name}
            </span>
          </nav>
        </header>
      }
    >
      <SiteHeaderNav />
    </Suspense>
  );
}
