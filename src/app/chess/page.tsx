import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TitledWinsTable } from "@/components/sections/chess/TitledWinsTable";
import {
  CHESS_ACCOUNTS,
  getChessAccountPeaks,
  TITLED_WINS,
  type ChessTimeControl,
  type TimeControlPeak,
} from "@/lib/chess";

export const metadata: Metadata = {
  title: "Chess",
};

const TIME_CONTROLS: Array<{ key: ChessTimeControl; label: string }> = [
  { key: "bullet", label: "Bullet" },
  { key: "blitz", label: "Blitz" },
  { key: "rapid", label: "Rapid" },
];

/** Stored values are “better than X%”; surface as Top (100−X)%. */
function formatTopPercent(betterThan: number | null): string | null {
  if (betterThan == null) return null;
  const top = Math.max(0.1, Math.round((100 - betterThan) * 10) / 10);
  const display = Number.isInteger(top) ? String(top) : top.toFixed(1);
  return `Top ${display}%`;
}

function formatPercentileDetail(betterThan: number): string {
  const rounded = Math.round(betterThan * 10) / 10;
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display}% percentile`;
}

function displayName(account: (typeof CHESS_ACCOUNTS)[number]): string {
  return account.label.split(" · ")[1] ?? account.username;
}

function RatingCell({
  peak,
  showPercentile,
}: {
  peak: TimeControlPeak | undefined;
  showPercentile: boolean;
}) {
  if (!peak) {
    return <span className="text-foreground-subtle">—</span>;
  }

  const top =
    showPercentile && peak.percentile != null ? formatTopPercent(peak.percentile) : null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-white tabular-nums tracking-tight">{peak.rating}</span>
      {top && peak.percentile != null ? (
        <span
          className="font-mono text-[9px] text-accent/75 w-fit cursor-help underline decoration-accent/25 underline-offset-2"
          title={formatPercentileDetail(peak.percentile)}
        >
          {top}
        </span>
      ) : null}
      {peak.gameUrl ? (
        <a
          href={peak.gameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors w-fit"
        >
          Best game ↗
        </a>
      ) : null}
    </div>
  );
}

export default function ChessPage() {
  const accountPeaks = getChessAccountPeaks();

  const titledAccountOptions = CHESS_ACCOUNTS.filter((account) =>
    TITLED_WINS.some((win) => win.accountId === account.id)
  ).map((account) => ({
    id: account.id,
    label: displayName(account),
    site: account.platform === "chesscom" ? "Chess.com" : "Lichess",
  }));

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <section className="relative border-b border-[#141414]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group"
            >
              <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span>
              Workbench
            </Link>

            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80 block">
                Chess
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.15] text-white">
                Moves I&apos;m still{" "}
                <span className="font-serif italic text-accent font-normal">thinking about.</span>
              </h1>
              <p className="text-foreground-muted text-sm leading-relaxed max-w-sm">
                “When you see a good move, look for a better one.” — Emanuel Lasker
              </p>
            </div>

            <nav
              aria-label="On this page"
              className="flex flex-wrap gap-x-5 gap-y-2 pt-2 font-mono text-[10px] uppercase tracking-widest"
            >
              <a href="#ratings" className="text-foreground-muted hover:text-white transition-colors">
                Peak ratings
              </a>
              <a
                href="#titled-wins"
                className="text-foreground-muted hover:text-white transition-colors"
              >
                Titled wins
              </a>
            </nav>
          </div>

          <div className="relative aspect-[4/3] lg:aspect-square order-1 lg:order-2 rounded-card border border-[#141414] overflow-hidden bg-[#0c0c0c]">
            <Image
              src="/images/hero/peek-chess.jpg"
              alt="Chess kit — board, pieces, and notes"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section
        id="ratings"
        className="max-w-7xl mx-auto px-6 py-14 md:py-16 border-b border-[#141414] scroll-mt-8"
      >
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted mb-6">
          Peak ratings
        </h2>

        <div className="overflow-x-auto border border-[#141414]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[#141414] font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
                <th className="px-4 py-3 font-normal">Account</th>
                {TIME_CONTROLS.map(({ key, label }) => (
                  <th key={key} className="px-4 py-3 font-normal">
                    {label}
                  </th>
                ))}
                <th className="px-4 py-3 font-normal text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]">
              {CHESS_ACCOUNTS.map((account) => {
                const peaks = accountPeaks[account.id];
                return (
                  <tr key={account.id} className="hover:bg-[#111111]/40 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white">{displayName(account)}</span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
                          {account.platform === "chesscom" ? "Chess.com" : "Lichess"}
                        </span>
                      </div>
                    </td>
                    {TIME_CONTROLS.map(({ key }) => (
                      <td key={key} className="px-4 py-4 align-top">
                        <RatingCell
                          peak={peaks[key]}
                          showPercentile={account.platform === "chesscom"}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-4 text-right align-top">
                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
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
      </section>

      <section id="titled-wins" className="max-w-7xl mx-auto px-6 py-14 md:py-20 scroll-mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Titled wins
          </h2>
          <p className="font-mono text-[9px] text-foreground-subtle">
            Chess.com & Lichess · {TITLED_WINS.length} unique opponents
          </p>
        </div>

        <TitledWinsTable wins={TITLED_WINS} accounts={titledAccountOptions} />
      </section>
    </main>
  );
}
