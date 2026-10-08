import { CHESS_ACCOUNT_PEAKS } from "./peaks.data";
import type {
  ChessAccountId,
  ChessAccountPeaks,
  ChessPeaks,
  ChessTimeControl,
  TimeControlPeak,
} from "./types";

export type { ChessAccountPeaks };

/** Prefer higher rating; ties go to aknaim main Chess.com, then other Chess.com, then Lichess. */
function accountPriority(accountId: ChessAccountId): number {
  if (accountId === "chesscom-aknaim") return 3;
  if (accountId === "chesscom-ablind") return 2;
  return 1;
}

function pickBest(candidates: Array<TimeControlPeak | null>): TimeControlPeak | null {
  let best: TimeControlPeak | null = null;
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (
      !best ||
      candidate.rating > best.rating ||
      (candidate.rating === best.rating &&
        accountPriority(candidate.accountId) > accountPriority(best.accountId))
    ) {
      best = candidate;
    }
  }
  return best;
}

/** Sticky peaks only — no live network on the Worker. */
export function getChessAccountPeaks(): ChessAccountPeaks {
  return CHESS_ACCOUNT_PEAKS;
}

export function getChessPeaks(accountPeaks?: ChessAccountPeaks): ChessPeaks {
  const peaks = accountPeaks ?? getChessAccountPeaks();
  const aknaim = peaks["chesscom-aknaim"];
  const ablind = peaks["chesscom-ablind"];
  const lichess = peaks["lichess-aknaim"];

  return {
    bullet: pickBest([aknaim.bullet ?? null, ablind.bullet ?? null, lichess.bullet ?? null]),
    blitz: pickBest([aknaim.blitz ?? null, ablind.blitz ?? null, lichess.blitz ?? null]),
    rapid: pickBest([aknaim.rapid ?? null, ablind.rapid ?? null, lichess.rapid ?? null]),
  };
}
