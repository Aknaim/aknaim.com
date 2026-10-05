import type { Metadata } from "next";
import Link from "next/link";
import { ClimbSendAdminForm } from "@/components/sections/admin/ClimbSendAdminForm";
import { getClimbingLocations } from "@/lib/db/queries/climbing";

export const metadata: Metadata = {
  title: "New Climb",
};

export default async function AdminClimbingNewPage() {
  const locations = await getClimbingLocations();

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/climbing"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Climbing
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">New climb</h1>
      </div>
      <ClimbSendAdminForm locations={locations} />
    </main>
  );
}
