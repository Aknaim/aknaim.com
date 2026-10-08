import type { Metadata } from "next";
import Link from "next/link";
import { GalleryAdminForm } from "@/components/sections/admin/GalleryAdminForm";
import { getDestinations } from "@/lib/db/queries/travel";

export const metadata: Metadata = {
  title: "New Gallery Item",
};

export default async function AdminGalleryNewPage() {
  const destinations = await getDestinations();
  const travelTrips = destinations.map((dest) => ({
    id: dest.id,
    label: dest.title.split(",")[0] ?? dest.title,
  }));

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/gallery"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Gallery
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          New gallery item
        </h1>
      </div>
      <GalleryAdminForm defaultInterest="travel" travelTrips={travelTrips} />
    </main>
  );
}
