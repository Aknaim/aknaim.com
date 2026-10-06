/**
 * Turbopack refuses to build when `public/media` is a Windows junction
 * pointing outside the repo (our local large-media store). Production
 * uploads go to R2, so we temporarily swap in an empty real directory
 * for OpenNext / next build, then restore the junction.
 *
 * Always clears `.next` / `.open-next` before deploy builds — OneDrive
 * often locks files in those trees (EPERM unlink) on Windows.
 *
 * Usage: node scripts/with-plain-public-media.mjs <command> [args...]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mediaPath = path.join(root, "public", "media");
const asidePath = path.join(root, "public", "media.__local_junction__");

function isOutsideLink(targetPath) {
  try {
    return fs.lstatSync(targetPath).isSymbolicLink();
  } catch {
    return false;
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function rmDir(targetPath) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      return;
    } catch (error) {
      lastError = error;
      sleep(300 * attempt);
    }
  }
  // Windows/OneDrive fallback: rename aside so Next can create a fresh .next
  try {
    const trash = `${targetPath}.trash-${Date.now()}`;
    fs.renameSync(targetPath, trash);
    console.warn(`Could not delete ${path.basename(targetPath)}; moved aside to ${path.basename(trash)}`);
    // Best-effort async cleanup of the trash folder
    try {
      fs.rmSync(trash, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    } catch {
      // ignore — OneDrive may finish later
    }
    return;
  } catch {
    // fall through
  }
  throw lastError;
}

function clearBuildCaches() {
  for (const dir of [".next", ".open-next"]) {
    const abs = path.join(root, dir);
    if (fs.existsSync(abs)) {
      console.log(`Clearing ${dir} before build.`);
      rmDir(abs);
    }
  }
}

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error("Usage: node scripts/with-plain-public-media.mjs <command> [args...]");
  process.exit(1);
}

let swapped = false;

try {
  if (fs.existsSync(mediaPath) && isOutsideLink(mediaPath)) {
    if (fs.existsSync(asidePath)) {
      rmDir(asidePath);
    }
    fs.renameSync(mediaPath, asidePath);
    fs.mkdirSync(mediaPath, { recursive: true });
    // Drop the ReadOnly flag OneDrive sometimes leaves on the parent path.
    try {
      fs.chmodSync(mediaPath, 0o755);
    } catch {
      // ignore
    }
    swapped = true;
    console.log(
      "Temporarily replaced public/media junction with an empty folder for build."
    );
  }

  clearBuildCaches();

  if (fs.existsSync(mediaPath) && isOutsideLink(mediaPath)) {
    throw new Error(
      "public/media is still a junction/symlink after swap — aborting build."
    );
  }

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  process.exitCode = result.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (swapped) {
    try {
      if (fs.existsSync(mediaPath) && !isOutsideLink(mediaPath)) {
        rmDir(mediaPath);
      } else if (fs.existsSync(mediaPath) && isOutsideLink(mediaPath)) {
        // Unexpected: leave aside in place for manual recovery.
        console.warn(
          "public/media is a link again; leaving media.__local_junction__ in place."
        );
        swapped = false;
      }
    } catch {
      // ignore
    }
    if (swapped && fs.existsSync(asidePath)) {
      fs.renameSync(asidePath, mediaPath);
      console.log("Restored public/media junction.");
    }
  }
}
