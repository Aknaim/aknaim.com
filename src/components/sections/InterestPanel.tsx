import { siteData } from "@/lib/data";
import { getProjectsByCategory } from "@/lib/utils";
import type { InterestId } from "@/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { InterestPanelContent } from "./InterestPanelContent";

interface InterestPanelProps {
  interestId: InterestId;
  fallbackBySrc: Record<string, boolean>;
}

function getDefaultTab(interestId: InterestId): string {
  const tabs = siteData.sectionTabs[interestId];
  const hasAll = tabs.some((tab) => tab.id === "all");
  if (hasAll) {
    return "all";
  }
  if (interestId === "climbing") {
    return "logbook";
  }
  return tabs[0]?.id ?? "all";
}

export function InterestPanel({
  interestId,
  fallbackBySrc,
}: InterestPanelProps) {
  const interest = siteData.interests.find((item) => item.id === interestId);
  if (!interest) {
    return null;
  }

  const tabs = siteData.sectionTabs[interestId];
  const projects = getProjectsByCategory(interestId);

  return (
    <section
      id={interest.panelAnchor}
      className="bento-panel flex min-h-[var(--panel-min-height)] flex-col rounded-card border border-[#262626] p-5 lg:p-6"
    >
      <SectionLabel label={interest.label} icon={interest.icon} />
      <div className="mt-5 flex-1">
        <InterestPanelContent
          interestId={interestId}
          label={interest.label}
          icon={interest.icon}
          tabs={tabs}
          projects={projects}
          defaultTabId={getDefaultTab(interestId)}
          fallbackBySrc={fallbackBySrc}
        />
      </div>
    </section>
  );
}
