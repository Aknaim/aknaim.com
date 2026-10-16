import sharp from "sharp";
import fs from "fs";
import path from "path";

const SRC = "scripts/assets/climbing-holds-sheet.png";
const OUT = "public/images/climbing/holds";
const COLS = 4;
const ROWS = 3;

const NAMES = [
  "terracotta-jug",
  "olive-sloper",
  "tan-pocket",
  "charcoal-crimp",
  "terracotta-edge",
  "dual-tex",
  "olive-pinch",
  "charcoal-sloper",
  "terracotta-pocket",
  "olive-edge",
  "tan-crimp",
  "charcoal-pinch",
];

/** True when pixel is neon green screen (incl. AA fringe toward green). */
function isGreenScreen(r, g, b) {
  // Strong green dominance
  if (g > 140 && g >= r + 40 && g >= b + 40) return true;
  // Near #00FF00 / bright key
  if (g > 200 && r < 120 && b < 120) return true;
  // Softer AA: green still clearly wins
  if (g > 100 && g > r * 1.35 && g > b * 1.35 && r < 160 && b < 160) return true;
  return false;
}

/** Mild green cast left after keying (halo that shows when zoomed). */
function hasGreenCast(r, g, b) {
  return g > r + 6 && g > b + 6 && g > 40;
}

fs.mkdirSync(OUT, { recursive: true });
for (const file of fs.readdirSync(OUT)) {
  if (file.endsWith(".png")) fs.unlinkSync(path.join(OUT, file));
}

// Match the dimmed plywood behind holds so leftover fringe blends into the wall.
const WALL = "public/images/climbing/progression-wall.png";
const wallSample = await sharp(WALL)
  .extract({ left: 400, top: 300, width: 200, height: 200 })
  .resize(32, 32)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let wr = 0;
let wg = 0;
let wb = 0;
const wallN = wallSample.info.width * wallSample.info.height;
for (let i = 0; i < wallN; i++) {
  wr += wallSample.data[i * 3];
  wg += wallSample.data[i * 3 + 1];
  wb += wallSample.data[i * 3 + 2];
}
const WALL_BRIGHTNESS = 0.78; // matches ClimbingProgression wall Image filter
const WALL_R = Math.round((wr / wallN) * WALL_BRIGHTNESS);
const WALL_G = Math.round((wg / wallN) * WALL_BRIGHTNESS);
const WALL_B = Math.round((wb / wallN) * WALL_BRIGHTNESS);

function paintWall(out, oi, alpha = 0) {
  out[oi] = WALL_R;
  out[oi + 1] = WALL_G;
  out[oi + 2] = WALL_B;
  out[oi + 3] = alpha;
}

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const cellW = Math.floor(width / COLS);
const cellH = Math.floor(height / ROWS);

/**
 * Seed at cell center (holds are centered on the sheet), flood the hold, and
 * clear everything else — including neighbor slivers that crossed the grid line.
 */
function keepBlobFromCenter(out, w, h) {
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  let seed = -1;

  // Prefer an opaque pixel at/near the cell center (bolt hole is often clear).
  outer: for (let r = 0; r < Math.max(w, h); r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        if (out[(y * w + x) * 4 + 3] !== 0) {
          seed = y * w + x;
          break outer;
        }
      }
    }
  }

  if (seed < 0) return 0;

  const keep = new Uint8Array(w * h);
  const stack = [seed];
  keep[seed] = 1;
  let count = 0;
  while (stack.length) {
    const p = stack.pop();
    count += 1;
    const px = p % w;
    const py = (p - px) / w;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = px + dx;
      const ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const ni = ny * w + nx;
      if (keep[ni] || out[ni * 4 + 3] === 0) continue;
      keep[ni] = 1;
      stack.push(ni);
    }
  }

  for (let i = 0; i < w * h; i++) {
    if (!keep[i]) out[i * 4 + 3] = 0;
  }
  return count;
}

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const index = row * COLS + col;
    const x0 = col * cellW;
    const y0 = row * cellH;
    const w = col === COLS - 1 ? width - x0 : cellW;
    const h = row === ROWS - 1 ? height - y0 : cellH;

    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const si = ((y0 + y) * width + (x0 + x)) * channels;
        const r = data[si];
        const g = data[si + 1];
        const b = data[si + 2];
        const oi = (y * w + x) * 4;
        if (isGreenScreen(r, g, b)) {
          paintWall(out, oi, 0);
        } else {
          out[oi] = r;
          out[oi + 1] = g;
          out[oi + 2] = b;
          out[oi + 3] = 255;
        }
      }
    }

    // Peel green fringe on silhouette (spill from key).
    for (let pass = 0; pass < 3; pass++) {
      const toClear = [];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const oi = (y * w + x) * 4;
          if (out[oi + 3] === 0) continue;
          let clearN = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (out[((y + dy) * w + (x + dx)) * 4 + 3] === 0) clearN += 1;
            }
          }
          if (clearN === 0) continue;
          const r = out[oi];
          const g = out[oi + 1];
          const b = out[oi + 2];
          // Green spill on edges
          if (clearN >= 2 && g > r + 15 && g > b + 15 && g > 80) toClear.push(oi);
          else if (clearN >= 3 && g > 90 && g >= r && g >= b && r < 140) toClear.push(oi);
        }
      }
      for (const oi of toClear) paintWall(out, oi, 0);
    }

    // Despill remaining edge pixels toward wall plywood (not neon green).
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const oi = (y * w + x) * 4;
        if (out[oi + 3] === 0) continue;
        let clearN = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (out[((y + dy) * w + (x + dx)) * 4 + 3] === 0) clearN += 1;
          }
        }
        if (clearN === 0) continue;
        const r = out[oi];
        const g = out[oi + 1];
        const b = out[oi + 2];
        if (hasGreenCast(r, g, b)) {
          // Blend hold edge toward wall so any leftover halo matches plywood.
          const t = Math.min(0.85, 0.35 + clearN * 0.08);
          out[oi] = Math.round(r * (1 - t) + WALL_R * t);
          out[oi + 1] = Math.round(g * (1 - t) + WALL_G * t);
          out[oi + 2] = Math.round(b * (1 - t) + WALL_B * t);
        } else if (g > r && g > b) {
          out[oi + 1] = Math.max(r, b);
        }
      }
    }

    // Break thin 1px bridges to neighbors, then keep the center-seeded hold.
    for (let pass = 0; pass < 2; pass++) {
      const toClear = [];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const oi = (y * w + x) * 4;
          if (out[oi + 3] === 0) continue;
          let opaqueN = 0;
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            if (out[((y + dy) * w + (x + dx)) * 4 + 3] !== 0) opaqueN += 1;
          }
          if (opaqueN <= 1) toClear.push(oi);
        }
      }
      for (const oi of toClear) paintWall(out, oi, 0);
    }

    const blobSize = keepBlobFromCenter(out, w, h);

    // Final pass: key residual green AA; paint transparent RGB as wall (premul-safe).
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const oi = (y * w + x) * 4;
        if (out[oi + 3] === 0) {
          paintWall(out, oi, 0);
          continue;
        }
        const r = out[oi];
        const g = out[oi + 1];
        const b = out[oi + 2];
        if (isGreenScreen(r, g, b)) {
          paintWall(out, oi, 0);
          continue;
        }
        let clearN = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
              clearN += 1;
              continue;
            }
            if (out[(ny * w + nx) * 4 + 3] === 0) clearN += 1;
          }
        }
        // Fix operator precedence bug-risk: use explicit parens
        if (
          clearN >= 3 &&
          hasGreenCast(r, g, b)
        ) {
          paintWall(out, oi, 0);
        }
      }
    }

    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (out[(y * w + x) * 4 + 3] === 0) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX) {
      console.log("empty", NAMES[index]);
      continue;
    }

    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);
    const tw = maxX - minX + 1;
    const th = maxY - minY + 1;

    const cropped = Buffer.alloc(tw * th * 4);
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const si = ((minY + y) * w + (minX + x)) * 4;
        const oi = (y * tw + x) * 4;
        cropped[oi] = out[si];
        cropped[oi + 1] = out[si + 1];
        cropped[oi + 2] = out[si + 2];
        cropped[oi + 3] = out[si + 3];
      }
    }

    const dest = path.join(
      OUT,
      `${String(index + 1).padStart(2, "0")}-${NAMES[index]}.png`
    );
    await sharp(cropped, {
      raw: { width: tw, height: th, channels: 4 },
    })
      .png()
      .toFile(dest);
    console.log("wrote", dest, `${tw}x${th}`, `blob=${blobSize}`);
  }
}
