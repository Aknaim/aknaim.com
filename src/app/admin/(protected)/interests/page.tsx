import type { Metadata } from "next";
import Link from "next/link";
import { listInterestSettingsForAdmin } from "@/lib/db/queries/interests";

export const metadata: Metadata = {
  title: "Admin Interests",
};

export default async function AdminInterestsPage() {
  const interests = await listInterestSettingsForAdmin();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-white">Interests</h1>
        <p className="text-sm text-foreground-muted mt-2">
          Toggle workbench vs cupboard and edit status-line copy. Bag art and tabs stay in
          code.
        </p>
      </div>

      <ul className="divide-y divide-[#141414] border border-[#141414]">
        {interests.map((interest) => (
          <li
            key={interest.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <Link
                href={`/admin/interests/${interest.id}`}
                className="text-sm text-white hover:text-accent transition-colors"
              >
                {interest.label}
              </Link>
              <div className="font-mono text-[10px] text-foreground-muted mt-1">
                {interest.id} · {interest.status}
              </div>
            </div>
            <Link
              href={`/admin/interests/${interest.id}`}
              className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
            >
              Edit →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
