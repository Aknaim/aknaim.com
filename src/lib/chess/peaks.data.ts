import type { ChessAccountPeaks } from "./types";

/**
 * Sticky peak ratings — avoid live Chess.com/Lichess fetches on Cloudflare Workers
 * (SSR subrequests / CPU limits). Refresh with: node scripts/refresh-chess-peaks.mjs
 */
export const CHESS_ACCOUNT_PEAKS: ChessAccountPeaks = {
  "chesscom-aknaim": {
    bullet: {
      rating: 2213,
      accountId: "chesscom-aknaim",
      sourceLabel: "Chess.com · Aknaim",
      percentile: 99.8,
      gameUrl: "https://www.chess.com/game/live/101656520",
    },
    blitz: {
      rating: 2219,
      accountId: "chesscom-aknaim",
      sourceLabel: "Chess.com · Aknaim",
      percentile: 99.8,
      gameUrl: "https://www.chess.com/game/live/147294832772",
    },
    rapid: {
      rating: 2020,
      accountId: "chesscom-aknaim",
      sourceLabel: "Chess.com · Aknaim",
      percentile: 99.7,
      gameUrl: "https://www.chess.com/game/live/184919241872",
    },
  },
  "chesscom-ablind": {
    bullet: {
      rating: 2294,
      accountId: "chesscom-ablind",
      sourceLabel: "Chess.com · ABlindChessPlayer",
      percentile: 99.8,
      gameUrl: "https://www.chess.com/game/live/5616715744",
    },
    blitz: {
      rating: 2203,
      accountId: "chesscom-ablind",
      sourceLabel: "Chess.com · ABlindChessPlayer",
      percentile: 99.7,
      gameUrl: "https://www.chess.com/game/live/51500358803",
    },
    rapid: {
      rating: 2202,
      accountId: "chesscom-ablind",
      sourceLabel: "Chess.com · ABlindChessPlayer",
      percentile: 99.9,
      gameUrl: "https://www.chess.com/game/live/166811091856",
    },
  },
  "lichess-aknaim": {
    bullet: {
      rating: 2137,
      accountId: "lichess-aknaim",
      sourceLabel: "Lichess · Aknaim",
      percentile: null,
      gameUrl: "https://lichess.org/CKNCxSS5",
    },
    blitz: {
      rating: 2280,
      accountId: "lichess-aknaim",
      sourceLabel: "Lichess · Aknaim",
      percentile: null,
      gameUrl: "https://lichess.org/5skeYFt1",
    },
    rapid: {
      rating: 2200,
      accountId: "lichess-aknaim",
      sourceLabel: "Lichess · Aknaim",
      percentile: null,
      gameUrl: "https://lichess.org/yEhJdMq9",
    },
  },
};
