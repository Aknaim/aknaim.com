import type { ClimbType } from "@/lib/climbing-grades";

export type ProgressionMilestone = {
  /** ISO date (YYYY-MM-DD) — single source of truth for ordering + display */
  date: string;
  /** Formatted from `date` for the timeline UI */
  dateLabel: string;
  label: string;
};

/** Clean finishes that count toward progression. */
const COUNTING_RESULTS = new Set([
  "onsight",
  "flash",
  "redpoint",
  "send",
  "one-hang",
]);

type RankedGrade = {
  kind: "rope" | "boulder";
  /** Higher = harder */
  rank: number;
  label: string;
};

export function formatMilestoneDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate.slice(0, 4);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function milestone(date: string, label: string): ProgressionMilestone {
  return { date, dateLabel: formatMilestoneDate(date), label };
}

/**
 * Pre-logbook milestones (not inferred from uploads).
 * Grade firsts here win over later uploads with the same label.
 */
export const BASELINE_PROGRESSION: ProgressionMilestone[] = [
  milestone("2024-05-05", "Started membership"),
  milestone("2024-06-06", "Top rope certified"),
  milestone("2024-06-11", "First V5"),
  milestone("2024-07-18", "First 5.11+"),
  milestone("2024-08-28", "First 5.12-"),
  milestone("2025-12-19", "Lead certified"),
];

/** Rope grades we track as firsts — at/above baseline (5.11+). */
const ROPE_MILESTONE_GRADES = [
  "5.11+",
  "5.12-",
  "5.12",
  "5.12+",
  "5.13-",
  "5.13",
  "5.13+",
] as const;

/** Boulder grades we track as firsts — at/above baseline (V5). */
const BOULDER_MILESTONE_GRADES = ["V5", "V6", "V7", "V8", "V9", "V10"] as const;

export function parseGrade(grade: string): RankedGrade | null {
  const raw = grade.trim();
  const boulder = raw.match(/^v(\d+)$/i);
  if (boulder) {
    const n = Number(boulder[1]);
    return { kind: "boulder", rank: n, label: `V${n}` };
  }

  const rope = raw.match(/^5\.(\d+)([+-])?$/i);
  if (!rope) return null;
  const base = Number(rope[1]);
  const suffix = rope[2] ?? "";
  const suffixRank = suffix === "-" ? 0 : suffix === "+" ? 2 : 1;
  return {
    kind: "rope",
    rank: base * 3 + suffixRank,
    label: `5.${base}${suffix}`,
  };
}

function ropeMilestoneLabel(gradeLabel: string): string {
  return `First ${gradeLabel}`;
}

function boulderMilestoneLabel(gradeLabel: string): string {
  return `First ${gradeLabel}`;
}

export type ProgressionSend = {
  grade: string;
  type: ClimbType;
  result: string;
  sessionDate: string | null;
};

/**
 * Infer grade milestones from logged climb session dates.
 * Exact grade only so a later send doesn't invent earlier firsts.
 */
export function buildProgressionFromSends(
  sends: ProgressionSend[]
): ProgressionMilestone[] {
  const eligible = sends
    .filter((send) => COUNTING_RESULTS.has(send.result) && send.sessionDate)
    .map((send) => ({
      ...send,
      parsed: parseGrade(send.grade),
      sessionDate: send.sessionDate as string,
    }))
    .filter((send) => send.parsed !== null)
    .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

  const seen = new Set<string>();
  const milestones: ProgressionMilestone[] = [];

  const ropeThreshold = parseGrade("5.11+")!.rank;
  const boulderThreshold = parseGrade("V5")!.rank;
  const ropeMilestoneSet = new Set<string>(ROPE_MILESTONE_GRADES);
  const boulderMilestoneSet = new Set<string>(BOULDER_MILESTONE_GRADES);

  for (const send of eligible) {
    const parsed = send.parsed!;

    if (
      parsed.kind === "rope" &&
      parsed.rank >= ropeThreshold &&
      ropeMilestoneSet.has(parsed.label)
    ) {
      const label = ropeMilestoneLabel(parsed.label);
      if (!seen.has(label)) {
        seen.add(label);
        milestones.push(milestone(send.sessionDate, label));
      }

      if (send.type === "lead" && parsed.rank >= parseGrade("5.12-")!.rank) {
        const leadLabel = "First 5.12 Lead";
        if (!seen.has(leadLabel)) {
          seen.add(leadLabel);
          milestones.push(milestone(send.sessionDate, leadLabel));
        }
      }
    }

    if (
      parsed.kind === "boulder" &&
      parsed.rank >= boulderThreshold &&
      boulderMilestoneSet.has(parsed.label)
    ) {
      const label = boulderMilestoneLabel(parsed.label);
      if (!seen.has(label)) {
        seen.add(label);
        milestones.push(milestone(send.sessionDate, label));
      }
    }
  }

  return milestones.sort((a, b) => a.date.localeCompare(b.date));
}

/** Merge baseline + inferred; baseline wins on duplicate labels. */
export function mergeProgression(
  baseline: ProgressionMilestone[],
  derived: ProgressionMilestone[]
): ProgressionMilestone[] {
  const byLabel = new Map<string, ProgressionMilestone>();
  for (const item of derived) byLabel.set(item.label, item);
  for (const item of baseline) byLabel.set(item.label, item);
  return [...byLabel.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Hardest rope grade among counting results; falls back to hardest boulder. */
export function hardestGradeLabel(sends: ProgressionSend[]): string | null {
  let bestRope: RankedGrade | null = null;
  let bestBoulder: RankedGrade | null = null;

  for (const send of sends) {
    if (!COUNTING_RESULTS.has(send.result)) continue;
    const parsed = parseGrade(send.grade);
    if (!parsed) continue;
    if (parsed.kind === "rope") {
      if (!bestRope || parsed.rank > bestRope.rank) bestRope = parsed;
    } else if (!bestBoulder || parsed.rank > bestBoulder.rank) {
      bestBoulder = parsed;
    }
  }

  if (bestRope && bestBoulder) {
    return `${bestRope.label} / ${bestBoulder.label}`;
  }
  return bestRope?.label ?? bestBoulder?.label ?? null;
}

/** Grades implied by "First …" baseline milestones (for peak when not yet logged as media). */
export function gradesFromBaseline(
  baseline: ProgressionMilestone[]
): ProgressionSend[] {
  const sends: ProgressionSend[] = [];
  for (const item of baseline) {
    const match = item.label.match(/^First (.+)$/);
    if (!match) continue;
    const grade = match[1];
    const parsed = parseGrade(grade);
    if (!parsed) continue;
    sends.push({
      grade,
      type: parsed.kind === "boulder" ? "bouldering" : "lead",
      result: "send",
      sessionDate: item.date,
    });
  }
  return sends;
}
