import { ActiveWorkbench } from "@/components/sections/ActiveWorkbench";
import { Hero } from "@/components/sections/Hero";
import { StorageCupboard } from "@/components/sections/StorageCupboard";
import { buildHomeAssetFallbackMap } from "@/lib/asset-utils";
import { getWorkbenchInterestLists } from "@/lib/interests/public";

/** Longer TTL — homepage is mostly static; admin save calls revalidatePath. */
export const revalidate = 3600;

export default async function Home() {
  const fallbackBySrc = buildHomeAssetFallbackMap();
  const { active: activeInterests, dormant: dormantInterests } =
    await getWorkbenchInterestLists();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Hero />
      <ActiveWorkbench
        items={activeInterests}
        fallbackBySrc={fallbackBySrc}
        bagPeekHint="Hover over a bag to peek inside."
      />
      <StorageCupboard
        items={dormantInterests}
        fallbackBySrc={fallbackBySrc}
      />
    </main>
  );
}
