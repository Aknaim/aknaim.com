"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ChessAccountId, TitledWin } from "@/lib/chess";

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

/** Short FIDE/OTB context for hover — not online rating. */
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

type AccountOption = {
  id: ChessAccountId;
  label: string;
  site: string;
};

type SortMode = "title" | "newest" | "oldest";

function titleRank(title: string): number {
  const index = TITLE_ORDER.indexOf(title as (typeof TITLE_ORDER)[number]);
  return index === -1 ? TITLE_ORDER.length : index;
}

function dateValue(playedAt?: string): number {
  if (!playedAt) return 0;
  const value = Date.parse(playedAt);
  return Number.isNaN(value) ? 0 : value;
}

function sortWins(wins: TitledWin[], sortMode: SortMode): TitledWin[] {
  return [...wins].sort((a, b) => {
    if (sortMode === "newest") {
      return dateValue(b.playedAt) - dateValue(a.playedAt);
    }
    if (sortMode === "oldest") {
      return dateValue(a.playedAt) - dateValue(b.playedAt);
    }
    const byTitle = titleRank(a.title) - titleRank(b.title);
    if (byTitle !== 0) return byTitle;
    return a.opponent.localeCompare(b.opponent);
  });
}

export function TitledWinsTable({
  wins,
  accounts,
}: {
  wins: TitledWin[];
  accounts: AccountOption[];
}) {
  const [titleFilter, setTitleFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<ChessAccountId | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("title");

  const availableTitles = useMemo(() => {
    const present = new Set(wins.map((win) => win.title));
    return TITLE_ORDER.filter((title) => present.has(title));
  }, [wins]);

  const filtered = useMemo(() => {
    const next = wins.filter((win) => {
      if (titleFilter !== "all" && win.title !== titleFilter) return false;
      if (accountFilter !== "all" && win.accountId !== accountFilter) return false;
      return true;
    });
    return sortWins(next, sortMode);
  }, [wins, titleFilter, accountFilter, sortMode]);

  const accountMeta = (accountId: ChessAccountId) =>
    accounts.find((account) => account.id === accountId);

  if (wins.length === 0) {
    return <p className="text-sm text-foreground-muted">No titled wins found yet.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <FilterRow label="Account">
          <FilterChip
            active={accountFilter === "all"}
            onClick={() => setAccountFilter("all")}
            label="All"
          />
          {accounts.map((account) => (
            <FilterChip
              key={account.id}
              active={accountFilter === account.id}
              onClick={() => setAccountFilter(account.id)}
              label={`${account.site} · ${account.label}`}
            />
          ))}
        </FilterRow>

        <FilterRow label="Title">
          <FilterChip
            active={titleFilter === "all"}
            onClick={() => setTitleFilter("all")}
            label="All"
          />
          {availableTitles.map((title) => (
            <FilterChip
              key={title}
              active={titleFilter === title}
              onClick={() => setTitleFilter(title)}
              label={title}
              hint={TITLE_BLURBS[title]}
            />
          ))}
        </FilterRow>
        <p className="font-mono text-[10px] text-foreground-subtle sm:pl-20">
          Hover a title for what it means (FIDE / national ranks — not online ratings).
        </p>

        <FilterRow label="Sort">
          <FilterChip
            active={sortMode === "title"}
            onClick={() => setSortMode("title")}
            label="Highest title"
          />
          <FilterChip
            active={sortMode === "newest"}
            onClick={() => setSortMode("newest")}
            label="Newest"
          />
          <FilterChip
            active={sortMode === "oldest"}
            onClick={() => setSortMode("oldest")}
            label="Oldest"
          />
        </FilterRow>
      </div>

      <p className="font-mono text-[11px] text-foreground-subtle">
        {filtered.length} of {wins.length}
      </p>

      <div className="overflow-x-auto border border-[#141414]">
        <table className="w-full min-w-[40rem] text-left text-base">
          <thead>
            <tr className="border-b border-[#141414] font-mono text-[11px] uppercase tracking-widest text-foreground-muted">
              <th className="px-5 py-3.5 font-normal">Title</th>
              <th className="px-5 py-3.5 font-normal">Opponent</th>
              <th className="px-5 py-3.5 font-normal">Account</th>
              <th className="px-5 py-3.5 font-normal">Site</th>
              <th className="px-5 py-3.5 font-normal">Date</th>
              <th className="px-5 py-3.5 font-normal text-right">Game</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {filtered.map((win) => {
              const account = accountMeta(win.accountId);
              return (
                <tr key={win.id} className="hover:bg-[#111111]/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <span
                      className="font-mono text-xs text-accent/90 cursor-help underline decoration-accent/25 underline-offset-2"
                      title={
                        TITLE_BLURBS[win.title as (typeof TITLE_ORDER)[number]] ??
                        win.title
                      }
                    >
                      {win.title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white">{win.opponent}</td>
                  <td className="px-5 py-3.5 text-foreground-subtle">
                    {account?.label ?? win.accountId}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-widest text-foreground-subtle">
                    {account?.site ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-foreground-subtle tabular-nums">
                    {win.playedAt ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <a
                      href={win.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] uppercase tracking-widest text-accent/80 hover:text-accent transition-colors"
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

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="font-mono text-[11px] uppercase tracking-widest text-foreground-subtle shrink-0 w-16">
        {label}
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      aria-label={hint ? `${label}: ${hint}` : undefined}
      className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
        active
          ? "border-accent/50 text-accent bg-accent/10"
          : "border-[#262626] text-foreground-muted hover:border-[#3a3a3a] hover:text-white"
      } ${
        hint
          ? "cursor-help underline decoration-accent/25 underline-offset-2"
          : ""
      }`}
    >
      {label}
    </button>
  );
}
