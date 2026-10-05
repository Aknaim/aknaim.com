import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DestinationAdminForm,
  TripAdminForm,
} from "@/components/sections/admin/TravelAdminForm";
import { getDestinations, getTripById } from "@/lib/db/queries/travel";

export const metadata: Metadata = {
  title: "Edit Destination",
};

export default async function AdminTravelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      </div>
      <DestinationAdminForm destination={destination} />
      <TripAdminForm destinationId={id} trip={trip} />
    </main>
  );
}
