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
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-mono text-[10px] uppercase tracking-widest text-accent">
              Admin
            </Link>
            <nav className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              <Link href="/admin/recipes" className="hover:text-white transition-colors">
                Recipes
              </Link>
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
