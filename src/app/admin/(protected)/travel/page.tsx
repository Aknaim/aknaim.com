import type { Metadata } from "next";
import Link from "next/link";
import { deleteDestination } from "@/lib/actions/admin/travel";
import { getDestinations } from "@/lib/db/queries/travel";

export const metadata: Metadata = {
  title: "Admin Travel",
};

export default async function AdminTravelPage() {
  const destinations = await getDestinations();

  return (
    <main className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Travel</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Manage destinations and trip hero media.
          </p>
        </div>
        <Link
          href="/admin/travel/new"
          className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
        >
          New destination
        </Link>
      </div>

      <ul className="divide-y divide-[#141414] border border-[#141414]">
        {destinations.length === 0 ? (
          <li className="px-4 py-6 text-sm text-foreground-muted">No destinations yet.</li>
        ) : (
          destinations.map((dest) => (
            <li key={dest.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Link
                  href={`/admin/travel/${dest.id}`}
                  className="text-sm text-white hover:text-accent transition-colors"
                >
                  {dest.number}. {dest.title}
                </Link>
                <div className="font-mono text-[10px] text-foreground-muted mt-1">
                  {dest.id} · {dest.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/travel/${dest.id}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
                >
                  View
                </Link>
                <form action={deleteDestination}>
                  <input type="hidden" name="id" value={dest.id} />
                  <button
                    type="submit"
                    className="font-mono text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
