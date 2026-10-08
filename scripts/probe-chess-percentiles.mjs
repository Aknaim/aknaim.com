/**
 * One-off helper to print Chess.com globalPercentile via StatsService.
 * Usage: node scripts/probe-chess-percentiles.mjs
 */
const headers = {
  "User-Agent": "aknaim.com/1.0 (personal site; percentile probe)",
  Accept: "application/json",
  "Content-Type": "application/json",
  Origin: "https://www.chess.com",
  Referer: "https://www.chess.com/member/aknaim/stats",
};

const STAT_TYPE = { bullet: 1, blitz: 2, rapid: 3 };

async function findPlayerId(username) {
  const html = await (
    await fetch(`https://www.chess.com/member/${username}`, {
      headers: { "User-Agent": headers["User-Agent"] },
    })
  ).text();
  const matches = [
    ...html.matchAll(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    ),
  ].map((m) => m[0]);
  const unique = [...new Set(matches)];
  return (
    unique.find((id) => id.endsWith("000000000000")) ??
    unique.find((id) => !["16ee479f-94ab-42da-85b4-19bc960ffbf3"].includes(id)) ??
    unique[0]
  );
}

async function percentile(playerId, timeControl) {
  const res = await fetch(
    "https://www.chess.com/service/stats/chesscom.stats.v1.StatsService/GetOverviewStats",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        playerId,
        statType: STAT_TYPE[timeControl],
        timeWindow: "TIME_WINDOW_ALL_TIME",
      }),
    }
  );
  const data = await res.json();
  return {
    rating: data.overviewRating?.rating,
    percentile: data.globalPercentile,
  };
}

for (const username of ["aknaim", "ablindchessplayer"]) {
  const playerId = await findPlayerId(username);
  console.log(username, playerId);
  for (const tc of ["bullet", "blitz", "rapid"]) {
    console.log(" ", tc, await percentile(playerId, tc));
  }
}
