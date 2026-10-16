import fs from "fs";
import path from "path";

const root = "src";
const exts = new Set([".tsx", ".ts", ".jsx", ".js"]);
const files = [];

function walk(d) {
  for (const name of fs.readdirSync(d)) {
    const p = path.join(d, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.has(path.extname(name))) files.push(p);
  }
}
walk(root);

const replacements = [
  // Pass 2: leftover xs mono eyebrows → token
  [/font-mono text-xs uppercase tracking-widest/g, "text-eyebrow"],
  [/font-mono text-xs uppercase tracking-\[0\.25em\]/g, "text-eyebrow tracking-[0.25em]"],
  [/font-mono text-xs uppercase tracking-\[0\.2em\]/g, "text-eyebrow tracking-[0.2em]"],
  [/font-mono text-xs uppercase tracking-wider/g, "text-eyebrow"],
  [/text-xs uppercase tracking-widest/g, "text-eyebrow"],
  [/text-xs uppercase tracking-\[0\.25em\]/g, "text-eyebrow tracking-[0.25em]"],
  // Interest / section page titles
  [/font-display text-4xl sm:text-5xl/g, "font-display text-5xl sm:text-6xl"],
  [/font-display text-4xl font-medium tracking-tight text-white sm:text-5xl/g, "font-display text-5xl font-medium tracking-tight text-white sm:text-6xl"],
  // Interest hero blurbs
  [/text-foreground-muted text-sm leading-relaxed/g, "text-foreground-muted text-base leading-relaxed"],
  [/text-foreground-muted text-sm max-w-md leading-relaxed/g, "text-foreground-muted text-base max-w-md leading-relaxed"],
  [/text-foreground-muted text-sm sm:text-\[15px\]/g, "text-foreground-muted text-base"],
  // Tiny interest detail body
  [/max-w-md text-xs text-foreground-subtle leading-relaxed/g, "max-w-md text-sm text-foreground-subtle leading-relaxed"],
  [/text-xs text-foreground-subtle leading-relaxed italic/g, "text-sm text-foreground-subtle leading-relaxed italic"],
  // Admin page titles
  [/font-display text-3xl font-light text-white/g, "font-display text-4xl font-light text-white"],
];

let changedFiles = 0;
let totalHits = 0;

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  let hits = 0;
  for (const [re, to] of replacements) {
    const m = src.match(re);
    if (m) hits += m.length;
    src = src.replace(re, to);
  }
  src = src.replace(/font-mono text-eyebrow/g, "text-eyebrow");
  src = src.replace(/text-eyebrow uppercase/g, "text-eyebrow");
  src = src.replace(/text-eyebrow tracking-widest/g, "text-eyebrow");
  src = src.replace(/text-xs text-xs/g, "text-xs");
  if (src !== before) {
    fs.writeFileSync(file, src);
    changedFiles += 1;
    totalHits += hits;
    console.log("updated", file, "hits~", hits);
  }
}

console.log("DONE files", changedFiles, "patternHits", totalHits);
