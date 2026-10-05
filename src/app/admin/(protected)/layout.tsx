import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAdmin } from "@/lib/actions/admin/auth";
import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/auth/admin";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(getAdminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }
}

const siteSections = [
  { href: "/admin/travel", label: "Travel" },
  { href: "/admin/climbing", label: "Climbing" },
  { href: "/admin/recipes", label: "Cooking" },
] as const;

const libraryLinks = [
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/media", label: "Media" },
] as const;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <header className="border-b border-[#141414] -mx-6 px-6 mb-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/admin" className="font-mono text-[10px] uppercase tracking-widest text-accent shrink-0">
              Admin
            </Link>
            <nav className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground-muted flex-wrap">
              {siteSections.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
              <span className="text-[#262626]" aria-hidden>
                |
              </span>
              {libraryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link href="/" className="hover:text-white transition-colors">
                View site
              </Link>
            </nav>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
