import Link from "next/link";
import { siteData } from "@/lib/data";
import { getInterestHref } from "@/lib/utils";
import type { InterestId } from "@/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { InterestTabsContainer } from "./InterestTabsContainer";

interface InterestPanelProps {
  interestId: InterestId;
}

export function InterestPanel({ interestId }: InterestPanelProps) {
  const interest = siteData.interests.find((item) => item.id === interestId);
  if (!interest) {
    return null;
  }

  return (
    <section
      id={interest.panelAnchor}
      className="bento-panel flex min-h-[var(--panel-min-height)] flex-col rounded-card border border-[#262626] p-5 lg:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <SectionLabel label={interest.label} icon={interest.icon} />
          <p className="text-meta text-foreground-muted">{interest.tagline}</p>
        </div>
        <Link
          href={getInterestHref(interestId)}
          className="shrink-0 text-meta uppercase tracking-widest text-foreground-subtle transition-colors hover:text-accent"
        >
          Explore →
        </Link>
      </div>

      <div className="mt-5 flex-1">
        <InterestTabsContainer tabs={interest.tabs} />
      </div>
    </section>
  );
}
