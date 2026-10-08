const headers = {
  "User-Agent": "aknaim.com/1.0 (personal site chess stats)",
  Accept: "application/json",
};

for (const u of ["aknaim", "ablindchessplayer"]) {
  const url = `https://api.chess.com/pub/player/${u}/stats`;
  const r = await fetch(url, { headers });
  console.log(u, r.status);
  if (!r.ok) {
    console.log(await r.text());
    continue;
  }
  const j = await r.json();
  console.log({
    bullet: j.chess_bullet?.best,
    blitz: j.chess_blitz?.best,
    rapid: j.chess_rapid?.best,
  });
}

const archives = await fetch("https://api.chess.com/pub/player/aknaim/games/archives", {
  headers,
});
console.log("archives", archives.status);
if (archives.ok) {
  const j = await archives.json();
  console.log("archive count", j.archives?.length, "latest", j.archives?.slice(-2));
  const latest = j.archives?.[j.archives.length - 1];
  if (latest) {
    const games = await fetch(latest, { headers });
    const gj = await games.json();
    const sample = gj.games?.[0];
    console.log("sample keys", sample && Object.keys(sample));
    console.log("white", sample?.white);
    console.log("black", sample?.black);
  }
}
