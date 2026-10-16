"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useState } from "react";
import type { ProgressionMilestone } from "@/lib/climbing-progression";
import { holdSrcForMilestone } from "@/lib/climbing-holds";

type LaidOutMilestone = {
  item: ProgressionMilestone;
  index: number;
  isLast: boolean;
  holdX: number;
  holdY: number;
  labelY: number;
  src: string;
  tilt: number;
};

/** Holds climb on the left; all copy sits in one right rail. */
const HOLD_CENTER_X = 34;
const HOLD_ZIG = 9;
const LABEL_RAIL_X = 56;
const HOLD_Y_TOP = 14;
const HOLD_Y_BOTTOM = 86;
const LABEL_Y_TOP = 10;
const LABEL_Y_BOTTOM = 90;
const LABEL_MIN_GAP = 10;

const HOLD_TILTS = [-11, 7, -4, 12, -8, 5, -14, 9, -6, 10, -9, 3];

function routeY(index: number, count: number): number {
  const t = count <= 1 ? 0 : index / (count - 1);
  return HOLD_Y_BOTTOM - t * (HOLD_Y_BOTTOM - HOLD_Y_TOP);
}

function holdX(index: number, count: number): number {
  const t = count <= 1 ? 0 : index / (count - 1);
  return HOLD_CENTER_X + Math.sin(t * Math.PI * 2.25) * HOLD_ZIG;
}

/** Keep labels near their holds, with a light min-gap so titles don’t collide. */
function spaceLabelYs(holdYs: number[]): number[] {
  const count = holdYs.length;
  if (count === 0) return [];
  if (count === 1) return [holdYs[0]];

  const span = LABEL_Y_BOTTOM - LABEL_Y_TOP;
  const gap = Math.min(LABEL_MIN_GAP, span / (count - 1));
  const labels = [...holdYs];

  for (let i = 1; i < count; i += 1) {
    const maxY = labels[i - 1] - gap;
    if (labels[i] > maxY) labels[i] = maxY;
  }
  if (labels[count - 1] < LABEL_Y_TOP) {
    labels[count - 1] = LABEL_Y_TOP;
    for (let i = count - 2; i >= 0; i -= 1) {
      const minY = labels[i + 1] + gap;
      if (labels[i] < minY) labels[i] = minY;
    }
  }
  if (labels[0] > LABEL_Y_BOTTOM) {
    labels[0] = LABEL_Y_BOTTOM;
    for (let i = 1; i < count; i += 1) {
      const maxY = labels[i - 1] - gap;
      if (labels[i] > maxY) labels[i] = maxY;
    }
  }

  return labels;
}

function layoutMilestones(
  timeline: ProgressionMilestone[]
): LaidOutMilestone[] {
  const count = timeline.length;
  const holdYs = timeline.map((_, index) => routeY(index, count));
  const labelYs = spaceLabelYs(holdYs);

  return timeline.map((item, index) => ({
    item,
    index,
    isLast: index === count - 1,
    holdX: holdX(index, count),
    holdY: holdYs[index],
    labelY: labelYs[index],
    src: holdSrcForMilestone(index, count),
    tilt: HOLD_TILTS[index % HOLD_TILTS.length],
  }));
}

function leaderPath(entry: LaidOutMilestone): string {
  const x0 = entry.holdX + 3;
  const y0 = entry.holdY;
  const x1 = LABEL_RAIL_X - 1;
  const y1 = entry.labelY;
  const cx = x0 + (x1 - x0) * 0.55;
  return [
    `M ${x0.toFixed(2)} ${y0.toFixed(2)}`,
    `C ${cx.toFixed(2)} ${y0.toFixed(2)}, ${cx.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`,
  ].join(" ");
}

function MilestoneCopy({
  item,
  isLast,
  active,
  onActiveChange,
}: {
  item: ProgressionMilestone;
  isLast: boolean;
  active: boolean;
  onActiveChange: (active: boolean) => void;
}) {
  const copy = (
    <span className="flex items-baseline gap-2 text-left">
      <span className="inline-flex min-w-0 items-baseline gap-1">
        {item.href ? (
          <Play
            className={`relative top-px size-2.5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-transform duration-200 ${
              active
                ? "scale-110 fill-accent text-accent"
                : "fill-accent/85 text-accent/85"
            }`}
            aria-hidden
          />
        ) : null}
        <span
          className={`text-sm leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] transition-colors duration-200 ${
            active
              ? "font-medium text-white"
              : isLast
                ? "font-medium text-white"
                : "text-white/90"
          }`}
        >
          {item.label}
        </span>
      </span>
      <span
        className={`shrink-0 text-eyebrow drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-colors duration-200 ${
          active ? "text-accent" : "text-accent/75"
        }`}
      >
        {item.dateLabel}
      </span>
    </span>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block transition-opacity hover:opacity-95"
        title="Watch send"
        onMouseEnter={() => onActiveChange(true)}
        onMouseLeave={() => onActiveChange(false)}
        onFocus={() => onActiveChange(true)}
        onBlur={() => onActiveChange(false)}
      >
        {copy}
      </Link>
    );
  }

  return copy;
}

function TimelineList({ timeline }: { timeline: ProgressionMilestone[] }) {
  return (
    <ol className="relative max-w-md">
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const body = (
          <>
            <p
              className={`flex items-center gap-1.5 text-base leading-snug ${
                isLast ? "font-medium text-white" : "text-foreground"
              }`}
            >
              {item.href ? (
                <Play
                  className="size-3 shrink-0 fill-accent/70 text-accent/70 transition-transform group-hover:scale-110"
                  aria-hidden
                />
              ) : null}
              <span>{item.label}</span>
            </p>
            <p className="mt-1 text-eyebrow text-foreground-muted">
              {item.dateLabel}
            </p>
          </>
        );

        return (
          <li
            key={`m-${item.date}-${item.label}`}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
              <span
                className={`block h-1.5 w-1.5 rounded-full ${
                  isLast
                    ? "bg-accent ring-2 ring-accent/25"
                    : "bg-[#2a2a2a] ring-1 ring-[#3a3a3a]"
                }`}
                aria-hidden
              />
              {!isLast ? (
                <span
                  className="mt-1 w-px min-h-[0.75rem] flex-1 bg-[#1a1a1a]"
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              {item.href ? (
                <Link
                  href={item.href}
                  className="group block transition-opacity hover:opacity-95"
                  title="Watch send"
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** sm+: compact spray-wall with labels. Smaller: list. */
export function ClimbingProgression({
  timeline,
}: {
  timeline: ProgressionMilestone[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (timeline.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        Milestones appear as you log climbs at 5.11+ and V5+.
      </p>
    );
  }

  const laidOut = layoutMilestones(timeline);

  return (
    <>
      <div className="sm:hidden">
        <TimelineList timeline={timeline} />
      </div>

      <div className="relative mx-auto hidden w-full max-w-2xl sm:block">
        <div className="relative aspect-[3/2] w-full">
          {/* Mask the plywood only — labels/holds sit above so copy never clips. */}
          <div
            className="absolute inset-0 [-webkit-mask-image:url('/images/climbing/progression-panel-mask.svg')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-image:url('/images/climbing/progression-panel-mask.svg')] [mask-repeat:no-repeat] [mask-size:100%_100%]"
            aria-hidden
          >
            <Image
              src="/images/climbing/progression-wall.png"
              alt=""
              fill
              className="scale-105 object-cover object-[center_40%] brightness-[0.78] contrast-[1.02] saturate-[0.72] blur-[1px]"
              sizes="42rem"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/35" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.22)_100%)]" />
            <div className="absolute inset-y-0 right-0 w-[44%] bg-gradient-to-l from-black/50 via-black/20 to-transparent" />
          </div>

          <svg
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {laidOut.map((entry) => {
              const active = activeIndex === entry.index;
              return (
                <path
                  key={`lead-${entry.index}`}
                  d={leaderPath(entry)}
                  fill="none"
                  stroke={
                    active
                      ? "rgba(197,160,89,0.7)"
                      : entry.isLast
                        ? "rgba(197,160,89,0.4)"
                        : "rgba(255,255,255,0.22)"
                  }
                  strokeWidth={active ? "1.25" : "1"}
                  strokeLinecap="round"
                  strokeDasharray={active ? "2.5 2" : "2 2.5"}
                  vectorEffect="non-scaling-stroke"
                  className="transition-[stroke,stroke-width,stroke-dasharray] duration-200"
                />
              );
            })}
          </svg>

          <ol className="pointer-events-none absolute inset-0 z-[3] list-none">
            {laidOut.map((entry) => {
              const sizeClass = entry.isLast
                ? "h-[3.5rem] w-[3.5rem]"
                : "h-[2.85rem] w-[2.85rem]";
              const active = activeIndex === entry.index;
              const holdVisual = (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ transform: `rotate(${entry.tilt}deg)` }}
                >
                  <span
                    className={`absolute left-[8%] top-[58%] h-[38%] w-[84%] rounded-[100%] bg-black/50 blur-[6px] transition-opacity duration-200 ${
                      active ? "opacity-80" : ""
                    }`}
                    aria-hidden
                  />
                  <Image
                    src={entry.src}
                    alt=""
                    fill
                    className={`object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)] transition-[filter,drop-shadow] duration-200 ${
                      active
                        ? "brightness-125 drop-shadow-[0_6px_14px_rgba(197,160,89,0.45)]"
                        : ""
                    }`}
                    sizes="60px"
                  />
                </div>
              );

              return (
                <li
                  key={`hold-${entry.index}`}
                  className="absolute"
                  style={{ left: `${entry.holdX}%`, top: `${entry.holdY}%` }}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    {entry.item.href ? (
                      <Link
                        href={entry.item.href}
                        title={`Watch send: ${entry.item.label}`}
                        aria-label={`Watch send: ${entry.item.label}`}
                        onMouseEnter={() => setActiveIndex(entry.index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onFocus={() => setActiveIndex(entry.index)}
                        onBlur={() => setActiveIndex(null)}
                        className={`pointer-events-auto relative block ${sizeClass} origin-center transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                          active ? "z-10 scale-125" : ""
                        }`}
                      >
                        {holdVisual}
                      </Link>
                    ) : (
                      <div
                        className={`pointer-events-none relative ${sizeClass}`}
                        aria-hidden
                      >
                        {holdVisual}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <ol className="pointer-events-none absolute inset-0 z-[4] list-none">
            {laidOut.map((entry) => (
              <li
                key={`label-${entry.item.date}-${entry.item.label}`}
                className="pointer-events-auto absolute w-[38%] max-w-[17rem] pl-2"
                style={{
                  left: `${LABEL_RAIL_X}%`,
                  top: `${entry.labelY}%`,
                  transform: "translateY(-50%)",
                }}
              >
                <MilestoneCopy
                  item={entry.item}
                  isLast={entry.isLast}
                  active={activeIndex === entry.index}
                  onActiveChange={(on) =>
                    setActiveIndex(on ? entry.index : null)
                  }
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
