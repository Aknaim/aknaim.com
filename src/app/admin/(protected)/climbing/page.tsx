import type { Metadata } from "next";
import Link from "next/link";
import { deleteClimbingSend } from "@/lib/actions/admin/climbing";
import { formatAdminDate, listClimbingSends } from "@/lib/db/queries/climbing";

export const metadata: Metadata = {
  title: "Admin Climbing",
};

export default async function AdminClimbingPage() {
  const sends = await listClimbingSends();

  return (
    <main className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Climbing</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Create sends with still / grade / video uploads and duration labels.
          </p>
        </div>
        <Link
          href="/admin/climbing/new"
          className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
        >
          New climb
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Climbs ({sends.length})
        </h2>
        <ul className="divide-y divide-[#141414] border border-[#141414]">
          {sends.length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">No climbs yet.</li>
          ) : (
            sends.map((send) => (
              <li key={send.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <Link
                    href={`/admin/climbing/${send.slug}`}
                    className="text-sm text-white hover:text-accent transition-colors"
                  >
                    {send.routeName}
                    {send.color ? (
                      <span className="text-foreground-muted"> · {send.color}</span>
                    ) : null}
                  </Link>
                  <div className="font-mono text-[10px] text-foreground-muted mt-1">
                    {formatAdminDate(send.sessionDate, send.sendDateLabel)}
                    {" · "}
                    {send.grade} · {send.locationName} · {send.result}
                    {send.durationLabel && send.durationLabel !== "—"
                      ? ` · ${send.durationLabel}`
                      : ""}
                  </div>
                </div>
                <form action={deleteClimbingSend}>
                  <input type="hidden" name="slug" value={send.slug} />
                  <button
                    type="submit"
                    className="font-mono text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
