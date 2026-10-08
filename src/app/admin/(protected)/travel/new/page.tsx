import type { Metadata } from "next";
import Link from "next/link";
import { TravelPlaceAdminForm } from "@/components/sections/admin/TravelAdminForm";

export const metadata: Metadata = {
  title: "New Place",
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
        <h1 className="font-display text-3xl font-light text-white mt-4">New place</h1>
        <p className="text-sm text-foreground-muted mt-2">
          Title, date, and highlight image create the card. A summary publishes the detail page.
        </p>
      </div>
      <TravelPlaceAdminForm />
    </main>
  );
}
