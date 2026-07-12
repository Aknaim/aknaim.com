import type { InterestId } from "@/types";
import { InterestPanel } from "./InterestPanel";

interface BentoGridProps {
  interestIds: InterestId[];
  fallbackBySrc: Record<string, boolean>;
}

export function BentoGrid({ interestIds, fallbackBySrc }: BentoGridProps) {
  return (
    <section
      className="page-container py-10 lg:py-12"
      aria-label="Workshop panels"
    >
      <div className="mb-8 lg:mb-10">
        <p className="text-tab text-accent">Deep Dive</p>
        <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
          Workshop panels
        </h2>
        <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-foreground-muted">
          Tab through logbooks, repositories, and recipes — the detailed
          workshop behind each active pursuit.
        </p>
      </div>

      <div className="bento-grid">
        {interestIds.map((id) => (
          <InterestPanel
            key={id}
            interestId={id}
            fallbackBySrc={fallbackBySrc}
          />
        ))}
      </div>
    </section>
  );
}
