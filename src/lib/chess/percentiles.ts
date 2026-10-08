import type { ChessAccountId, ChessTimeControl } from "./types";

/**
 * Chess.com “better than X%” snapshots from the stats pages.
 * Pub API doesn’t expose these — update by hand (or re-probe) when you care.
 */
export const CHESSCOM_PERCENTILES: Partial<
  Record<ChessAccountId, Partial<Record<ChessTimeControl, number>>>
> = {
  "chesscom-aknaim": {
    bullet: 99.8,
    blitz: 99.8,
    rapid: 99.7,
  },
  "chesscom-ablind": {
    bullet: 99.8,
    blitz: 99.7,
    rapid: 99.9,
  },
};

export function chessComPercentile(
  accountId: ChessAccountId,
  timeControl: ChessTimeControl
): number | null {
  const value = CHESSCOM_PERCENTILES[accountId]?.[timeControl];
  return typeof value === "number" ? value : null;
}
