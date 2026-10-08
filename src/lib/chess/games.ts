import type { ChessAccountPeaks } from "./types";
import type { ChessAccountId, ChessGameLink, ChessTimeControl } from "./types";

const TIME_CONTROLS: ChessTimeControl[] = ["bullet", "blitz", "rapid"];

/** Extra curated games beyond peak-rating games from the APIs. */
export const CHESS_EXTRA_GAMES: ChessGameLink[] = [];

/** One peak game per account × time control, from live stats. */
export function peakGamesByAccount(accountPeaks: ChessAccountPeaks): ChessGameLink[] {
  const games: ChessGameLink[] = [];

  for (const [accountId, peaks] of Object.entries(accountPeaks) as Array<
    [ChessAccountId, ChessAccountPeaks[ChessAccountId]]
  >) {
    for (const timeControl of TIME_CONTROLS) {
      const peak = peaks[timeControl];
      if (!peak?.gameUrl) continue;
      games.push({
        id: `peak-${accountId}-${timeControl}`,
        title: `${capitalize(timeControl)} peak`,
        platform: accountId.startsWith("lichess") ? "lichess" : "chesscom",
        accountId,
        timeControl,
        url: peak.gameUrl,
        note: `${peak.rating}`,
      });
    }
  }

  return games;
}

export function allBestGames(accountPeaks: ChessAccountPeaks): ChessGameLink[] {
  return [...peakGamesByAccount(accountPeaks), ...CHESS_EXTRA_GAMES];
}

export function gamesGroupedByAccount(
  games: ChessGameLink[],
  accountOrder: ChessAccountId[]
): Array<{ accountId: ChessAccountId; games: ChessGameLink[] }> {
  return accountOrder
    .map((accountId) => ({
      accountId,
      games: games.filter((game) => game.accountId === accountId),
    }))
    .filter((group) => group.games.length > 0);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
