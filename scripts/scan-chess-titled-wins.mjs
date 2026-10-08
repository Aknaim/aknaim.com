/**
 * Scans Chess.com archives + Lichess game export for wins vs titled players.
 * Usage: node scripts/scan-chess-titled-wins.mjs
 * Writes: src/lib/chess/titled-wins.data.ts
 */
import fs from "node:fs";
import path from "node:path";

const chessHeaders = {
  "User-Agent": "aknaim.com/1.0 (personal site; titled-win scan)",
  Accept: "application/json",
};

const lichessHeaders = {
  "User-Agent": "aknaim.com/1.0 (personal site; titled-win scan)",
  Accept: "application/x-ndjson",
};

const TITLES = ["GM", "WGM", "IM", "WIM", "FM", "WFM", "NM", "WNM", "CM", "WCM"];
const TITLE_SET = new Set(TITLES);

const CHESSCOM_ACCOUNTS = [
  { id: "chesscom-aknaim", username: "aknaim" },
  { id: "chesscom-ablind", username: "ablindchessplayer" },
];

const LICHESS_ACCOUNTS = [{ id: "lichess-aknaim", username: "Aknaim" }];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url, { headers: chessHeaders });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function loadChessComTitledMap() {
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const title of TITLES) {
    const data = await fetchJson(`https://api.chess.com/pub/titled/${title}`);
    for (const username of data.players ?? []) {
      const key = String(username).toLowerCase();
      if (!map.has(key)) map.set(key, title);
    }
    await sleep(150);
  }
  return map;
}

function isWinForChessCom(username, game) {
  const me = username.toLowerCase();
  const white = game.white?.username?.toLowerCase();
  const black = game.black?.username?.toLowerCase();
  if (white === me) return game.white?.result === "win";
  if (black === me) return game.black?.result === "win";
  return false;
}

function opponentOfChessCom(username, game) {
  const me = username.toLowerCase();
  const white = game.white?.username?.toLowerCase();
  if (white === me) return game.black;
  return game.white;
}

function dedupeWins(wins) {
  const byKey = new Map();
  for (const win of wins) {
    const key = `${win.accountId}|${win.opponent.toLowerCase()}|${win.title}`;
    const existing = byKey.get(key);
    if (!existing || (win.playedAt && existing.playedAt && win.playedAt < existing.playedAt)) {
      byKey.set(key, win);
    }
  }
  return Array.from(byKey.values());
}

async function scanChessComAccount(account, titledMap) {
  const archives = await fetchJson(
    `https://api.chess.com/pub/player/${account.username}/games/archives`
  );
  const wins = [];
  const urls = archives.archives ?? [];
  console.log(`chess.com ${account.username}: ${urls.length} months`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const month = await fetchJson(url);
      for (const game of month.games ?? []) {
        if (!isWinForChessCom(account.username, game)) continue;
        const opp = opponentOfChessCom(account.username, game);
        const oppName = opp?.username;
        if (!oppName) continue;
        const title = titledMap.get(oppName.toLowerCase());
        if (!title) continue;
        wins.push({
          id: `${account.id}-${game.uuid || `${game.end_time}-${oppName}`}`,
          accountId: account.id,
          opponent: oppName,
          title,
          url: game.url,
          timeControl: game.time_class,
          playedAt: game.end_time
            ? new Date(game.end_time * 1000).toISOString().slice(0, 10)
            : undefined,
        });
      }
    } catch (err) {
      console.warn("skip", url, err.message);
    }
    if (i % 10 === 0) console.log(`  ${account.username} ${i + 1}/${urls.length}`);
    await sleep(120);
  }

  return dedupeWins(wins);
}

async function scanLichessAccount(account) {
  const url =
    `https://lichess.org/api/games/user/${account.username}` +
    `?rated=true&moves=false&perfType=bullet,blitz,rapid&tags=false&clocks=false&evals=false&opening=false`;

  console.log(`lichess ${account.username}: streaming…`);
  const res = await fetch(url, { headers: lichessHeaders });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  if (!res.body) throw new Error("No response body from Lichess");

  const wins = [];
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let games = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      games += 1;
      if (games % 500 === 0) console.log(`  ${account.username} ${games} games…`);

      let game;
      try {
        game = JSON.parse(line);
      } catch {
        continue;
      }

      const me = account.username.toLowerCase();
      const white = game.players?.white;
      const black = game.players?.black;
      const whiteName = white?.user?.name?.toLowerCase() ?? white?.user?.id;
      const blackName = black?.user?.name?.toLowerCase() ?? black?.user?.id;
      if (!whiteName || !blackName) continue;

      const iAmWhite = whiteName === me;
      const iAmBlack = blackName === me;
      if (!iAmWhite && !iAmBlack) continue;
      if (game.winner !== (iAmWhite ? "white" : "black")) continue;

      const opp = iAmWhite ? black : white;
      const title = opp?.user?.title;
      if (!title || !TITLE_SET.has(title)) continue;

      const oppName = opp.user?.name ?? opp.user?.id;
      if (!oppName) continue;

      wins.push({
        id: `${account.id}-${game.id}`,
        accountId: account.id,
        opponent: oppName,
        title,
        url: `https://lichess.org/${game.id}`,
        timeControl: game.perf ?? game.speed,
        playedAt: game.lastMoveAt
          ? new Date(game.lastMoveAt).toISOString().slice(0, 10)
          : game.createdAt
            ? new Date(game.createdAt).toISOString().slice(0, 10)
            : undefined,
      });
    }
  }

  console.log(`lichess ${account.username}: ${games} games scanned`);
  return dedupeWins(wins);
}

async function main() {
  console.log("Loading Chess.com titled player lists…");
  const titledMap = await loadChessComTitledMap();
  console.log("Chess.com titled usernames:", titledMap.size);

  const all = [];

  for (const account of CHESSCOM_ACCOUNTS) {
    const wins = await scanChessComAccount(account, titledMap);
    console.log(`chess.com ${account.username}: ${wins.length} unique titled wins`);
    all.push(...wins);
  }

  for (const account of LICHESS_ACCOUNTS) {
    const wins = await scanLichessAccount(account);
    console.log(`lichess ${account.username}: ${wins.length} unique titled wins`);
    all.push(...wins);
  }

  all.sort((a, b) => {
    const titleRank = (t) => TITLES.indexOf(t);
    const tr = titleRank(a.title) - titleRank(b.title);
    if (tr !== 0) return tr;
    return a.opponent.localeCompare(b.opponent);
  });

  const outPath = path.join(process.cwd(), "src/lib/chess/titled-wins.data.ts");
  const body = `import type { TitledWin } from "./types";

/** Generated by scripts/scan-chess-titled-wins.mjs — re-run to refresh. */
export const TITLED_WINS: TitledWin[] = ${JSON.stringify(all, null, 2)};
`;
  fs.writeFileSync(outPath, body, "utf8");
  console.log("Wrote", outPath, "count", all.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
