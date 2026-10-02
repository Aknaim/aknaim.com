import { ActiveWorkbench } from "@/components/sections/ActiveWorkbench";
import { Hero } from "@/components/sections/Hero";
import { StorageCupboard } from "@/components/sections/StorageCupboard";
import { buildAssetFallbackMap } from "@/lib/asset-utils";
import { getActiveInterests, getDormantInterests } from "@/lib/utils";

export default function Home() {
  const fallbackBySrc = buildAssetFallbackMap();
  const activeInterests = getActiveInterests();
  const dormantInterests = getDormantInterests();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Hero />
      <ActiveWorkbench
        items={activeInterests}
        fallbackBySrc={fallbackBySrc}
      />
      {/* BentoGrid intentionally omitted for now */}
      <StorageCupboard
        items={dormantInterests}
        fallbackBySrc={fallbackBySrc}
      />
    </main>
  );
}
