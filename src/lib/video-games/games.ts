import type { VideoGame } from "./types";

/**
 * League (stats) first, then shelf/catalog titles.
 * Catalog rows with `href` are clickable covers.
 */
export const VIDEO_GAMES: VideoGame[] = [
  {
    id: "league-of-legends",
    label: "League of Legends",
    sectionId: "shelf",
    kind: "stats",
    blurb: "5v5 MOBA · ranked ladder",
    about:
      "The big competitive strategy game of its era — five-player teams, last-hitting, and a ruthless ranked grind.",
    spineColor: "#1a4d8c",
  },
  {
    id: "runescape-3",
    label: "RuneScape 3",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "MMORPG · endless skills",
    about:
      "A long-running fantasy MMO — skills, quests, and the slow satisfaction of watching a hiscore tick up.",
    href: "https://secure.runescape.com/m=hiscore/a=13/compare?user1=aknaim",
    spineColor: "#3d6b2f",
  },
  {
    id: "halo",
    label: "Halo Series",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "Sci-fi shooters",
    about: "Microsoft’s flagship FPS saga — campaigns, arena multiplayer, and that blue-team energy.",
    spineColor: "#c4a35a",
  },
  {
    id: "left-4-dead",
    label: "Left 4 Dead",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "Co-op zombie shooter",
    about: "Four survivors, one AI director, and a lot of friendly fire — co-op chaos at its best.",
    spineColor: "#8b1e1e",
  },
  {
    id: "assassins-creed",
    label: "Assassin's Creed",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "Stealth · parkour · history",
    about: "Historical open-world stealth — rooftops, conspiracies, and leaping into haystacks.",
    spineColor: "#5c4033",
  },
  {
    id: "prince-of-persia",
    label: "Prince of Persia",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "Platforming · time tricks",
    about: "Acrobatic platforming and puzzles — running walls, reversing time, saving the princess.",
    spineColor: "#b8860b",
  },
  {
    id: "god-of-war",
    label: "God of War",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "Action · mythology",
    about:
      "Mythic combat and spectacle — blades, axes, and picking fights with gods (and winning).",
    spineColor: "#8b2e1a",
  },
  {
    id: "age-of-empires",
    label: "Age of Empires",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "Real-time strategy",
    about: "Classic RTS — gather, build, tech up, and boom your way through history.",
    spineColor: "#2f4f4f",
  },
  {
    id: "age-of-mythology",
    label: "Age of Mythology",
    sectionId: "shelf",
    kind: "catalog",
    blurb: "RTS · gods & myths",
    about: "Age of Empires with pantheons — myth units, god powers, and legendary campaigns.",
    spineColor: "#6b3fa0",
  },
];
