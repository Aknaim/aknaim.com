import type { Metadata } from "next";
import { TravelPageClient } from "@/components/sections/travel/TravelPageClient";
import { getDestinations, getTravelStats } from "@/lib/db/queries/travel";

export const metadata: Metadata = {
  title: "Travel",
};

export const revalidate = 60;

export default async function TravelPage() {
  const [destinations, travelStats] = await Promise.all([
    getDestinations(),
    getTravelStats(),
  ]);

  return <TravelPageClient destinations={destinations} travelStats={travelStats} />;
}
