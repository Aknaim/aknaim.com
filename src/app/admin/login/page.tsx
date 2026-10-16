import type { Metadata } from "next";
import { loginAdmin } from "@/lib/actions/admin/auth";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = params.error;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const errorMessage =
    error === "rate"
      ? "Too many attempts. Wait a few minutes and try again."
      : error === "1"
        ? "Incorrect password. Try again."
        : null;

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <form action={loginAdmin} className="w-full max-w-sm space-y-6 border border-[#141414] bg-[#0c0c0c] p-8">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-light text-white">Admin</h1>
          <p className="text-sm text-foreground-muted">Enter the admin password to continue.</p>
        </div>
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-2">
          <span className="text-eyebrow text-foreground-muted">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        {errorMessage ? (
          <p className="text-sm text-red-400">{errorMessage}</p>
        ) : null}
        <button
          type="submit"
          className="w-full border border-[#262626] bg-[#141414] px-4 py-2 text-eyebrow text-white hover:border-accent transition-colors"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
