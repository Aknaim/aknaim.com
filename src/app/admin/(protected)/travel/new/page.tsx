import type { Metadata } from "next";
import Link from "next/link";
import { DestinationAdminForm } from "@/components/sections/admin/TravelAdminForm";

export const metadata: Metadata = {
  title: "New Destination",
};

export default function AdminTravelNewPage() {
  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/travel"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Travel
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">New destination</h1>
      </div>
      <DestinationAdminForm />
    </main>
  );
}
