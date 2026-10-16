"use client";

import { useMemo, useState } from "react";
import type { ChessAccountId, ChessTimeControl, TitledWin } from "@/lib/chess";

const FORMAT_ORDER: ChessTimeControl[] = ["bullet", "blitz", "rapid"];

/** Short time-control context (hover on format cells). */
const FORMAT_BLURBS: Record<ChessTimeControl, string> = {
  bullet: "Bullet — under 3 minutes per player; very fast online chess.",
  blitz: "Blitz — 3–10 minutes per player; the usual online speed.",
  rapid: "Rapid — 10+ minutes per player; slower, more deliberate games.",
};

const TITLE_ORDER = [
  "GM",
  "WGM",
  "IM",
  "WIM",
  "FM",
  "WFM",
  "NM",
  "WNM",
  "CM",
  "WCM",
] as const;

/** Short FIDE / national-title context (hover on title cells). */
const TITLE_BLURBS: Record<(typeof TITLE_ORDER)[number], string> = {
  GM: "Grandmaster — ~2500+ FIDE; elite over-the-board title.",
  WGM: "Woman Grandmaster — FIDE women’s title, roughly ~2300+ FIDE.",
  IM: "International Master — ~2400 FIDE; roughly top 0.2% of rated players.",
  WIM: "Woman International Master — FIDE women’s title, roughly ~2200 FIDE.",
  FM: "FIDE Master — ~2300 FIDE; strong international level.",
  WFM: "Woman FIDE Master — FIDE women’s title, roughly ~2100 FIDE.",
  NM: "National Master — usually ~2200 national rating.",
  WNM: "Woman National Master — national women’s master title.",
  CM: "Candidate Master — ~2200 FIDE entry-level master title.",
  WCM: "Woman Candidate Master — FIDE women’s candidate title, roughly ~2000 FIDE.",
};

function titleBlurb(title: string): string | undefined {
  return TITLE_BLURBS[title as (typeof TITLE_ORDER)[number]];
}

function formatBlurb(timeControl?: string): string | undefined {
  if (!timeControl) return undefined;
  return FORMAT_BLURBS[timeControl as ChessTimeControl];
}

function formatLabel(timeControl?: string): string {
  if (!timeControl) return "—";
  return timeControl.charAt(0).toUpperCase() + timeControl.slice(1);
}

type AccountOption = {
  id: ChessAccountId;
  label: string;
  site: string;
};

type SortKey = "title" | "opponent" | "format" | "account" | "site" | "date";
type SortDir = "asc" | "desc";
type SortEntry = { key: SortKey; dir: SortDir };

const SORTABLE: SortKey[] = [
  "title",
  "opponent",
  "format",
  "account",
  "site",
  "date",
];

function titleRank(title: string): number {
  const index = TITLE_ORDER.indexOf(title as (typeof TITLE_ORDER)[number]);
  return index === -1 ? TITLE_ORDER.length : index;
}

function formatRank(timeControl?: string): number {
  if (!timeControl) return FORMAT_ORDER.length;
  const index = FORMAT_ORDER.indexOf(timeControl as ChessTimeControl);
  return index === -1 ? FORMAT_ORDER.length : index;
}

function dateValue(playedAt?: string): number {
  if (!playedAt) return 0;
  const value = Date.parse(playedAt);
  return Number.isNaN(value) ? 0 : value;
}

function compareKey(
  a: TitledWin,
  b: TitledWin,
  key: SortKey,
  dir: SortDir,
  accountMeta: (id: ChessAccountId) => AccountOption | undefined
): number {
  let result = 0;
  switch (key) {
    case "title":
      result = titleRank(a.title) - titleRank(b.title);
      break;
    case "opponent":
      result = a.opponent.localeCompare(b.opponent);
      break;
    case "format":
      result = formatRank(a.timeControl) - formatRank(b.timeControl);
      break;
    case "account": {
      const la = accountMeta(a.accountId)?.label ?? a.accountId;
      const lb = accountMeta(b.accountId)?.label ?? b.accountId;
      result = la.localeCompare(lb);
      break;
    }
    case "site": {
      const sa = accountMeta(a.accountId)?.site ?? "";
      const sb = accountMeta(b.accountId)?.site ?? "";
      result = sa.localeCompare(sb);
      break;
    }
    case "date":
      result = dateValue(a.playedAt) - dateValue(b.playedAt);
      break;
  }
  return dir === "asc" ? result : -result;
}

function sortWins(
  wins: TitledWin[],
  sorts: SortEntry[],
  accountMeta: (id: ChessAccountId) => AccountOption | undefined
): TitledWin[] {
  const keys =
    sorts.length > 0 ? sorts : ([{ key: "title", dir: "asc" }] as SortEntry[]);
  return [...wins].sort((a, b) => {
    for (const { key, dir } of keys) {
      const result = compareKey(a, b, key, dir, accountMeta);
      if (result !== 0) return result;
    }
    return a.opponent.localeCompare(b.opponent);
  });
}

/** Default direction when a column is first added to the sort stack. */
function defaultDir(key: SortKey): SortDir {
  if (key === "date") return "desc"; // newest first
  return "asc"; // title: highest first (GM=0); others A→Z / format order
}

function SortHeader({
  label,
  sortKey,
  sorts,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sorts: SortEntry[];
  onSort: (key: SortKey) => void;
}) {
  const index = sorts.findIndex((entry) => entry.key === sortKey);
  const active = index !== -1;
  const entry = active ? sorts[index] : null;
  const arrow = entry ? (entry.dir === "asc" ? " ↑" : " ↓") : "";
  const priority =
    active && sorts.length > 1 ? ` ${index + 1}` : "";

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      title={
        active
          ? `Sort ${index + 1}: ${label} (${entry?.dir === "asc" ? "ascending" : "descending"}). Click to flip; click again when primary to clear.`
          : `Add ${label} to sort (combines with other selected columns)`
      }
      className={`text-eyebrow transition-colors ${
        active ? "text-accent" : "text-foreground-muted hover:text-white"
      }`}
    >
      {label}
      {arrow}
      {priority}
    </button>
  );
}

export function TitledWinsTable({
  wins,
  accounts,
}: {
  wins: TitledWin[];
  accounts: AccountOption[];
}) {
  /** Click order = priority. Empty → default highest title. */
  const [sorts, setSorts] = useState<SortEntry[]>([
    { key: "title", dir: "asc" },
  ]);

  const accountMeta = (accountId: ChessAccountId) =>
    accounts.find((account) => account.id === accountId);

  const sorted = useMemo(
    () => sortWins(wins, sorts, accountMeta),
    [wins, sorts, accounts]
  );

  const handleSort = (key: SortKey) => {
    setSorts((current) => {
      const index = current.findIndex((entry) => entry.key === key);
      if (index === 0) {
        // Primary: flip direction; if already flipped once from default, clear column
        const primary = current[0];
        if (primary.dir === defaultDir(key)) {
          return [{ ...primary, dir: primary.dir === "asc" ? "desc" : "asc" }, ...current.slice(1)];
        }
        // Second click on primary after flip → remove it
        const rest = current.slice(1);
        return rest.length > 0 ? rest : [{ key: "title", dir: "asc" }];
      }
      if (index > 0) {
        // Promote to primary, keep direction
        const entry = current[index];
        return [entry, ...current.filter((_, i) => i !== index)];
      }
      // New column becomes primary
      return [{ key, dir: defaultDir(key) }, ...current];
    });
  };

  if (wins.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">No titled wins found yet.</p>
    );
  }

  const sortSummary =
    sorts.length === 0
      ? "highest title"
      : sorts
          .map((entry, index) => {
            const name =
              entry.key === "title"
                ? "Title"
                : entry.key === "opponent"
                  ? "Opponent"
                  : entry.key === "format"
                    ? "Format"
                    : entry.key === "account"
                      ? "Account"
                      : entry.key === "site"
                        ? "Site"
                        : "Date";
            const dir = entry.dir === "asc" ? "↑" : "↓";
            return sorts.length > 1
              ? `${index + 1}. ${name} ${dir}`
              : `${name} ${dir}`;
          })
          .join(" · ");

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs text-foreground-subtle">
        {sorted.length} win{sorted.length === 1 ? "" : "s"}
        <span className="text-foreground-subtle/70">
          {" · "}
          sort: {sortSummary}
        </span>
      </p>

      <div className="overflow-x-auto border border-[#141414]">
        <table className="w-full min-w-[44rem] text-left text-base">
          <thead>
            <tr className="border-b border-[#141414] text-eyebrow text-foreground-muted">
              {SORTABLE.map((key) => (
                <th key={key} className="px-5 py-3.5 font-normal">
                  <SortHeader
                    label={
                      key === "title"
                        ? "Title"
                        : key === "opponent"
                          ? "Opponent"
                          : key === "format"
                            ? "Format"
                            : key === "account"
                              ? "Account"
                              : key === "site"
                                ? "Site"
                                : "Date"
                    }
                    sortKey={key}
                    sorts={sorts}
                    onSort={handleSort}
                  />
                </th>
              ))}
              <th className="px-5 py-3.5 font-normal text-right">Game</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {sorted.map((win) => {
              const account = accountMeta(win.accountId);
              return (
                <tr
                  key={win.id}
                  className="transition-colors hover:bg-[#111111]/40"
                >
                  <td className="px-5 py-3.5">
                    <span
                      title={titleBlurb(win.title)}
                      className="cursor-help font-mono text-xs text-accent/90 underline decoration-accent/25 underline-offset-2"
                    >
                      {win.title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white">{win.opponent}</td>
                  <td className="px-5 py-3.5">
                    <span
                      title={formatBlurb(win.timeControl)}
                      className="cursor-help text-eyebrow text-foreground-subtle underline decoration-foreground-subtle/30 underline-offset-2"
                    >
                      {formatLabel(win.timeControl)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-foreground-subtle">
                    {account?.label ?? win.accountId}
                  </td>
                  <td className="px-5 py-3.5 text-eyebrow text-foreground-subtle">
                    {account?.site ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-foreground-subtle">
                    {win.playedAt ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <a
                      href={win.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-eyebrow text-accent/80 transition-colors hover:text-accent"
                    >
                      Open ↗
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
