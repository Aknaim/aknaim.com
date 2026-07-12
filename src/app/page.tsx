import { ActiveWorkbench } from "@/components/sections/ActiveWorkbench";
import { BentoGrid } from "@/components/sections/BentoGrid";
import { Hero } from "@/components/sections/Hero";
import { StorageCupboard } from "@/components/sections/StorageCupboard";
import { buildAssetFallbackMap } from "@/lib/asset-utils";
import {
  getActiveInterests,
  getDormantInterests,
} from "@/lib/utils";
import type { InterestId } from "@/types";

export default function Home() {
  const fallbackBySrc = buildAssetFallbackMap();
  const activeInterests = getActiveInterests();
  const dormantInterests = getDormantInterests();
  const activePanelIds = activeInterests.map(
    (interest) => interest.id,
  ) as InterestId[];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Hero />
      <ActiveWorkbench
        items={activeInterests}
        fallbackBySrc={fallbackBySrc}
      />
      <StorageCupboard
        items={dormantInterests}
        fallbackBySrc={fallbackBySrc}
      />
    </main>
  );
}
