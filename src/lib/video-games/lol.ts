import type { LolAccount } from "./types";

function opGgNaUrl(gameName: string, tagLine: string): string {
  const slug = `${gameName}-${tagLine}`.replace(/\s+/g, "");
  return `https://op.gg/lol/summoners/na/${encodeURIComponent(slug)}`;
}

function championsUrl(gameName: string, tagLine: string, seasonId: number): string {
  return `${opGgNaUrl(gameName, tagLine)}/champions?season_id=${seasonId}`;
}

/**
 * Scraped from op.gg ladder + champions pages (2026-03).
 * Refresh with: node scripts/probe-opgg.mjs (or re-scrape seasons/champs).
 *
 * Percentiles are approximate for the Diamond-5 / pre-Emerald ladder era —
 * Diamond sat roughly in the top ~2%; Platinum ~top 8–10%; Gold ~top 25–30%.
 */
export const LOL_ACCOUNTS: LolAccount[] = [
  {
    id: "lol-aknaim",
    gameName: "aknaim",
    tagLine: "NA1",
    region: "na",
    role: "main",
    seasons: [
      { label: "S7", tier: "Diamond 5", percentile: 98 },
      { label: "S6", tier: "Diamond 5", percentile: 98 },
      { label: "S5", tier: "Diamond 5", percentile: 98 },
    ],
    topChampions: [
      { name: "Thresh", record: "64W 52L 55%" },
      { name: "Brand", record: "23W 10L 70%" },
      { name: "Kha'Zix", record: "7W 7L 50%" },
    ],
    championsSeasonLabel: "S7",
    opGgUrl: opGgNaUrl("aknaim", "NA1"),
    championsUrl: championsUrl("aknaim", "NA1", 7),
  },
  {
    id: "lol-kungfuscyther",
    gameName: "kungfuscyther",
    tagLine: "NA1",
    region: "na",
    role: "smurf",
    seasons: [
      { label: "S6", tier: "Platinum 4", percentile: 92 },
      { label: "S5", tier: "Platinum 5", percentile: 90 },
      { label: "S7", tier: "Gold 1", percentile: 75 },
    ],
    topChampions: [
      { name: "Thresh", record: "20W 7L 74%" },
      { name: "Kha'Zix", record: "7W 2L 78%" },
      { name: "Nautilus", record: "5W 2L 71%" },
    ],
    championsSeasonLabel: "S6",
    opGgUrl: opGgNaUrl("kungfuscyther", "NA1"),
    championsUrl: championsUrl("kungfuscyther", "NA1", 6),
  },
];
