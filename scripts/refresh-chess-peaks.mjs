/**
 * Fetches Chess.com + Lichess peaks and prints a peaks.data.ts payload to paste/update.
 * Usage: node scripts/refresh-chess-peaks.mjs
 */
const headers = {
  Accept: "application/json",
  "User-Agent": "aknaim.com/1.0 (personal site; refresh chess peaks)",
};

async function chessCom(username) {
  const s = await (
    await fetch(`https://api.chess.com/pub/player/${username}/stats`, { headers })
  ).json();
  return {
    bullet: s.chess_bullet?.best,
    blitz: s.chess_blitz?.best,
    rapid: s.chess_rapid?.best,
  };
}

async function lichess(tc) {
  const s = await (
    await fetch(`https://lichess.org/api/user/Aknaim/perf/${tc}`, { headers })
  ).json();
  return {
    rating: s.stat?.highest?.int,
    gameId: s.stat?.highest?.gameId,
    percentile: typeof s.percentile === "number" ? s.percentile : null,
  };
}

const [aknaim, ablind, bullet, blitz, rapid] = await Promise.all([
  chessCom("aknaim"),
  chessCom("ablindchessplayer"),
  lichess("bullet"),
  lichess("blitz"),
  lichess("rapid"),
]);

console.log(
  JSON.stringify(
    {
      aknaim,
      ablind,
      lichess: { bullet, blitz, rapid },
      note: "Update src/lib/chess/peaks.data.ts + percentiles from Chess.com stats pages",
    },
    null,
    2
  )
);
