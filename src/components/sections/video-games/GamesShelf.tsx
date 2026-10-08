"use client";

import { useState } from "react";
import { LOL_ACCOUNTS, VIDEO_GAMES, type LolAccount, type VideoGame } from "@/lib/video-games";

function formatTopPercent(betterThan: number | null): string | null {
  if (betterThan == null) return null;
  const top = Math.max(0.1, Math.round((100 - betterThan) * 10) / 10);
  const display = Number.isInteger(top) ? String(top) : top.toFixed(1);
  return `Top ${display}%`;
}

export function GamesShelf() {
  const [expandedId, setExpandedId] = useState<string | null>("league-of-legends");

  return (
    <ul className="flex flex-col gap-2">
      {VIDEO_GAMES.map((game) => {
        const expandable = game.kind === "stats";
        const isOpen = expandable && expandedId === game.id;

        return (
          <li key={game.id} className="border border-[#1c1c1c] bg-[#0e0e0e]">
            <SpineRow
              game={game}
              expandable={expandable}
              isOpen={isOpen}
              onToggle={() =>
                setExpandedId((current) => (current === game.id ? null : game.id))
              }
            />
            {isOpen ? (
              <div className="border-t border-[#1c1c1c] px-4 py-6 space-y-10">
                {game.id === "league-of-legends"
                  ? LOL_ACCOUNTS.map((account) => (
                      <LolAccountPanel key={account.id} account={account} />
                    ))
                  : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function SpineRow({
  game,
  expandable,
  isOpen,
  onToggle,
}: {
  game: VideoGame;
  expandable: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const spine = game.spineColor ?? "#2a2a2a";
  const className =
    "relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors " +
    (expandable || game.href ? "hover:bg-[#121212]" : "");

  const content = (
    <>
      <span
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: spine }}
        aria-hidden
      />
      <span className="pl-3 flex flex-col gap-1 min-w-0 flex-1 pr-3">
        <span className="text-sm text-white">{game.label}</span>
        {game.blurb ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
            {game.blurb}
          </span>
        ) : null}
        {game.about ? (
          <span className="text-xs text-foreground-muted leading-relaxed max-w-xl">
            {game.about}
          </span>
        ) : null}
      </span>
      <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-foreground-muted shrink-0 self-start pt-1">
        {expandable ? (isOpen ? "Collapse" : "Expand") : game.href ? "Open ↗" : null}
      </span>
    </>
  );

  if (expandable) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={className}
      >
        {content}
      </button>
    );
  }

  if (game.href) {
    return (
      <a
        href={game.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

function LolAccountPanel({ account }: { account: LolAccount }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-white text-lg tracking-tight">{account.gameName}</h3>
            <span
              className="font-mono text-[9px] uppercase tracking-widest text-accent/80 cursor-help underline decoration-accent/25 underline-offset-2"
              title={
                account.role === "main"
                  ? "Main — the primary account, where the serious ranked climb happened."
                  : "Smurf — a secondary account, often used to practice or play outside the main ladder."
              }
            >
              {account.role === "main" ? "Main" : "Smurf"}
            </span>
          </div>
          <p className="font-mono text-[9px] text-foreground-subtle mt-1">
            #{account.tagLine} · NA
          </p>
        </div>
        <div className="flex flex-wrap gap-4 font-mono text-[9px] uppercase tracking-widest">
          <a
            href={account.opGgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/80 hover:text-accent transition-colors"
          >
            Profile ↗
          </a>
          <a
            href={account.championsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-muted hover:text-white transition-colors"
          >
            Champions ↗
          </a>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#141414]">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[#141414] font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
              <th className="px-4 py-3 font-normal">Season</th>
              <th className="px-4 py-3 font-normal">Rank</th>
              <th className="px-4 py-3 font-normal">Percentile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {account.seasons.map((season) => {
              const top = formatTopPercent(season.percentile);
              return (
                <tr
                  key={`${account.id}-${season.label}`}
                  className="hover:bg-[#111111]/40 transition-colors"
                >
                  <td className="px-4 py-3 text-white">{season.label}</td>
                  <td className="px-4 py-3 text-white">{season.tier}</td>
                  <td className="px-4 py-3">
                    {top && season.percentile != null ? (
                      <span
                        className="font-mono text-[9px] text-accent/75 cursor-help underline decoration-accent/25 underline-offset-2"
                        title={`~${season.percentile}% · approx. for ${season.tier} in that era`}
                      >
                        ~{top}
                      </span>
                    ) : (
                      <span className="text-foreground-subtle">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle mb-2">
          Top champs
          {account.championsSeasonLabel ? ` · ${account.championsSeasonLabel}` : ""}
        </p>
        <ul className="flex flex-wrap gap-2">
          {account.topChampions.map((champ) => (
            <li key={champ.name} className="border border-[#1c1c1c] px-3 py-2 text-sm">
              <span className="text-white">{champ.name}</span>
              {champ.record ? (
                <span className="font-mono text-[9px] text-foreground-subtle ml-2">
                  {champ.record}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
