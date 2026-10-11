import type { ProgressionMilestone } from "@/lib/climbing-progression";

/** Desktop roadmap geometry (viewBox units). */
const ROADMAP_WIDTH = 1000;
const ROADMAP_HEIGHT = 220;
const ROADMAP_AMPLITUDE = 52;
const ROADMAP_PAD_X = 56;

function roadmapPoint(index: number, count: number) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const x = ROADMAP_PAD_X + t * (ROADMAP_WIDTH - ROADMAP_PAD_X * 2);
  const wave = Math.sin(t * Math.PI * 2);
  const y = ROADMAP_HEIGHT / 2 + wave * ROADMAP_AMPLITUDE;
  return { x, y, wave };
}

function roadmapPath(count: number): string {
  if (count <= 0) return "";
  const samples = Math.max(count * 12, 48);
  const parts: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = ROADMAP_PAD_X + t * (ROADMAP_WIDTH - ROADMAP_PAD_X * 2);
    const y = ROADMAP_HEIGHT / 2 + Math.sin(t * Math.PI * 2) * ROADMAP_AMPLITUDE;
    parts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.join(" ");
}

function MilestoneCopy({
  item,
  isLast,
  align,
}: {
  item: ProgressionMilestone;
  isLast: boolean;
  align: "left" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 ${
        align === "center" ? "items-center text-center" : "items-start text-left"
      }`}
    >
      <span className="font-mono text-[9px] uppercase tracking-widest text-accent/70">
        {item.dateLabel}
      </span>
      <span
        className={`text-[13px] leading-snug ${
          isLast ? "text-white font-medium" : "text-foreground-muted"
        }`}
      >
        {item.label}
      </span>
    </div>
  );
}

function Dot({ isLast }: { isLast: boolean }) {
  return (
    <span
      className={`block h-1.5 w-1.5 rounded-full ${
        isLast
          ? "bg-accent ring-2 ring-accent/25"
          : "bg-[#2a2a2a] ring-1 ring-[#3a3a3a]"
      }`}
      aria-hidden
    />
  );
}

/** Mobile: compact vertical. Desktop: horizontal sine roadmap. */
export function ClimbingProgression({
  timeline,
}: {
  timeline: ProgressionMilestone[];
}) {
  if (timeline.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        Milestones appear as you log climbs at 5.11+ and V5+.
      </p>
    );
  }

  const path = roadmapPath(timeline.length);

  return (
    <>
      {/* Mobile / tablet — vertical spine */}
      <ol className="relative max-w-md lg:hidden">
        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1;
          return (
            <li
              key={`m-${item.date}-${item.label}`}
              className="relative flex gap-3 pb-3 last:pb-0"
            >
              <div className="flex flex-col items-center shrink-0 w-3 pt-1.5">
                <Dot isLast={isLast} />
                {!isLast ? (
                  <span
                    className="mt-1 w-px flex-1 min-h-[0.75rem] bg-[#1a1a1a]"
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <MilestoneCopy item={item} isLast={isLast} align="left" />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop — horizontal sine roadmap */}
      <div className="relative hidden lg:block w-full">
        <div className="relative h-[280px] w-full">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${ROADMAP_WIDTH} ${ROADMAP_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="text-[#1f1f1f]"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="3 5"
              className="text-accent/20"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="absolute inset-0 list-none">
            {timeline.map((item, index) => {
              const isLast = index === timeline.length - 1;
              const { x, y, wave } = roadmapPoint(index, timeline.length);
              const left = (x / ROADMAP_WIDTH) * 100;
              const top = (y / ROADMAP_HEIGHT) * 100;
              // Labels sit on the outside of the curve.
              const labelBelow = wave >= 0;

              return (
                <li
                  key={`d-${item.date}-${item.label}`}
                  className="absolute"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <Dot isLast={isLast} />
                    <div
                      className={`absolute left-1/2 w-[7.25rem] -translate-x-1/2 ${
                        labelBelow ? "top-3" : "bottom-3"
                      }`}
                    >
                      <MilestoneCopy
                        item={item}
                        isLast={isLast}
                        align="center"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}
