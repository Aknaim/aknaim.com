const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "text/html",
};

function parseSeasons(html) {
  const simple = [];
  const re =
    /<(?:strong)[^>]*>\s*(S\d{1,2}|S20\d{2})\s*<\/strong>[\s\S]{0,600}?medals_mini\/([a-z_]+)\.png[\s\S]{0,240}?>([^<]+)<\/span>/gi;
  let m;
  while ((m = re.exec(html))) {
    simple.push({ season: m[1], medal: m[2], tier: m[3].trim() });
  }
  return simple;
}

function parseChampions(html) {
  // champion rows often include champion name in alt or text near play counts
  const champs = [];
  const re =
    /alt="([^"]+)"[^>]*>[\s\S]{0,200}?class="[^"]*champion[^"]*"[\s\S]{0,400}?(\d+)\s*(?:W|Play)/gi;
  let m;
  while ((m = re.exec(html)) && champs.length < 10) {
    champs.push({ name: m[1], n: m[2] });
  }

  // fallback: look for opgg champion image paths
  const re2 =
    /\/champions\/([^/.]+)[\s\S]{0,300}?>(\d+)\s*<\/(?:div|span|td)>/gi;
  while ((m = re2.exec(html)) && champs.length < 15) {
    champs.push({ slug: m[1], n: m[2] });
  }
  return champs;
}

for (const slug of ["aknaim-NA1", "kungfuscyther-NA1"]) {
  const html = await (
    await fetch(`https://op.gg/lol/summoners/na/${slug}`, { headers })
  ).text();
  console.log("\n====", slug);
  console.log("seasons", parseSeasons(html));

  // Extract ladder table chunk
  const idx = html.indexOf("Ladder Rank");
  console.log("Ladder Rank idx", idx);
  const chunk = html.slice(Math.max(0, html.indexOf(">S")), html.indexOf(">S") + 8000);
  const seasons = [...chunk.matchAll(/>(S\d{1,2}|S20\d{2})\s*</g)].map((x) => x[1]);
  console.log("S tags near start", seasons.slice(0, 30));
}

for (const seasonId of [6, 7, 8, 9, 11]) {
  const url = `https://op.gg/lol/summoners/na/aknaim-NA1/champions?season_id=${seasonId}`;
  const html = await (await fetch(url, { headers })).text();
  console.log("\nchamps season", seasonId, "len", html.length);
  console.log(parseChampions(html).slice(0, 8));
  // print first champion-looking text blocks
  const i = html.indexOf("Most champions");
  console.log("most", i, html.slice(i, i + 200).replace(/\s+/g, " "));
}
