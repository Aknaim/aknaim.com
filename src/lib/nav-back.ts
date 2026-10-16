export type NavCrumb = {
  href: string;
  label: string;
};

/**
 * Sticky-header trail for public pages (excluding home / admin).
 * First crumb is always Workbench → `/` so home stays one click.
 * Nested routes add a parent interest crumb.
 */
export function getNavCrumbs(
  pathname: string,
  searchParams?: Pick<URLSearchParams, "get">
): NavCrumb[] | null {
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  const workbench: NavCrumb = { href: "/", label: "Workbench" };

  if (pathname === "/gallery/cooking") {
    return [workbench, { href: "/cooking", label: "Cooking" }];
  }
  if (pathname === "/gallery/climbing") {
    return [workbench, { href: "/climbing", label: "Climbing" }];
  }
  if (pathname === "/gallery/travel") {
    const trip = searchParams?.get("trip");
    if (trip) {
      return [
        workbench,
        { href: "/travel", label: "Travel" },
        { href: `/travel/${trip}`, label: "Trip" },
      ];
    }
    return [workbench, { href: "/travel", label: "Travel" }];
  }

  if (pathname.startsWith("/cooking/") && pathname !== "/cooking") {
    return [workbench, { href: "/cooking", label: "Cooking" }];
  }

  if (pathname.startsWith("/travel/") && pathname !== "/travel") {
    return [workbench, { href: "/travel", label: "Travel" }];
  }

  return [workbench];
}
