export type GameId =
  | "league-of-legends"
  | "runescape-3"
  | "halo"
  | "left-4-dead"
  | "assassins-creed"
  | "prince-of-persia"
  | "god-of-war"
  | "age-of-empires"
  | "age-of-mythology";

export type GameKind = "stats" | "catalog";

export interface VideoGame {
  id: GameId;
  label: string;
  sectionId: string;
  kind: GameKind;
  /** Short line under the title on the shelf */
  blurb?: string;
  /** Slightly fuller note for hover */
  about?: string;
  /** Optional outbound link (e.g. RS3 hiscores) */
  href?: string;
  /** Accent color for spine/cover styling */
  spineColor?: string;
}

export interface LolChampion {
  name: string;
  /** e.g. "64W 52L 55%" */
  record?: string;
}

export interface LolSeason {
  /** Display label, e.g. S7 */
  label: string;
  tier: string;
  /**
   * Approximate better-than percentile for that tier in that era.
   * op.gg does not expose historical percentiles — estimated from public rank distributions.
   */
  percentile: number | null;
}

export interface LolAccount {
  id: string;
  gameName: string;
  tagLine: string;
  region: "na";
  role: "main" | "smurf";
  /** Best seasons first (top 3) */
  seasons: LolSeason[];
  /** Top champions from peak season */
  topChampions: LolChampion[];
  championsSeasonLabel?: string;
  opGgUrl: string;
  championsUrl: string;
}
