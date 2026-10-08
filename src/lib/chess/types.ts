export type ChessTimeControl = "bullet" | "blitz" | "rapid";

export type ChessPlatform = "chesscom" | "lichess";

export type ChessAccountId = "chesscom-ablind" | "chesscom-aknaim" | "lichess-aknaim";

export interface ChessAccount {
  id: ChessAccountId;
  platform: ChessPlatform;
  username: string;
  label: string;
  profileUrl: string;
}

export interface TimeControlPeak {
  rating: number;
  accountId: ChessAccountId;
  sourceLabel: string;
  /** Better-than percentile (0–100), when known */
  percentile: number | null;
  gameUrl?: string;
}

export interface ChessPeaks {
  bullet: TimeControlPeak | null;
  blitz: TimeControlPeak | null;
  rapid: TimeControlPeak | null;
}

export type ChessAccountPeaks = Record<
  ChessAccountId,
  Partial<Record<ChessTimeControl, TimeControlPeak>>
>;

export interface ChessGameLink {
  id: string;
  title: string;
  platform: ChessPlatform;
  accountId: ChessAccountId;
  timeControl: ChessTimeControl;
  url: string;
  note?: string;
}

export interface TitledWin {
  id: string;
  accountId: ChessAccountId;
  opponent: string;
  title: string;
  url: string;
  timeControl?: ChessTimeControl | string;
  playedAt?: string;
}
