import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TravelPlaceAdminForm } from "@/components/sections/admin/TravelAdminForm";
import { getDestinations, getTripById } from "@/lib/db/queries/travel";

export const metadata: Metadata = {
  title: "Edit Place",
};

export default async function AdminTravelEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const destinations = await getDestinations();
  const destination = destinations.find((d) => d.id === id);
  if (!destination) notFound();

  const trip = await getTripById(id);

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/travel"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Travel
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          Edit {destination.title}
        </h1>
        <p className="text-sm text-foreground-muted mt-2">
          {trip
            ? "Detail page is live. Clear the summary and save to make this card-only again."
            : "Card only for now — add a summary below to publish the detail page."}
        </p>
      </div>
      <TravelPlaceAdminForm
        destination={destination}
        trip={trip}
        saved={saved === "1"}
      />
    </main>
  );
}
