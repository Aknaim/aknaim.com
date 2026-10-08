/**
 * Seed Workers KV INTEREST_SETTINGS with current shell values from Neon (or site defaults).
 * Usage: node scripts/seed-interest-kv.mjs
 */
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import postgres from "postgres";

const defaults = {
  engineering: {
    status: "active",
    workbenchNote: "Building and tuning systems — the day job on the bench.",
    lastActive: null,
  },
  climbing: {
    status: "active",
    workbenchNote:
      "Gym sessions, projects, and the next grade — logged one send at a time.",
    lastActive: null,
  },
  cooking: {
    status: "active",
    workbenchNote: "Outdoor pizza nights, dough experiments, and curry on rotation.",
    lastActive: null,
  },
  photography: {
    status: "dormant",
    workbenchNote: "Chasing light — primes, landscapes, and golden-hour alarms.",
    lastActive: "2024-10-01",
  },
  languages: {
    status: "dormant",
    workbenchNote: "Arabic script and MSA — building fluency one class at a time.",
    lastActive: null,
  },
  travel: {
    status: "active",
    workbenchNote: "Trip notes, galleries, and mapping the next slow road.",
    lastActive: "2024-07-01",
  },
  woodworking: {
    status: "dormant",
    workbenchNote: "George Brown CE — carpentry and home renovation shop skills.",
    lastActive: "2023-01-01",
  },
  chess: {
    status: "active",
    workbenchNote: "Peak ratings and titled wins — sharp lines under the clock.",
    lastActive: null,
  },
  "video-games": {
    status: "dormant",
    workbenchNote: "Favorites on the shelf — campaigns, co-op nights, and long queues.",
    lastActive: null,
  },
};

const neonUrl =
  process.env.DATABASE_URL_NEON_PRODUCTION?.trim().replace(/^['"]|['"]$/g, "") ||
  process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");

const shell = structuredClone(defaults);

if (neonUrl) {
  const sql = postgres(neonUrl, { max: 1 });
  try {
    const rows = await sql`
      SELECT id, status, workbench_note, last_active
      FROM interest_settings
    `;
    for (const row of rows) {
      shell[row.id] = {
        status: row.status,
        workbenchNote: row.workbench_note,
        lastActive: row.last_active,
      };
    }
  } finally {
    await sql.end();
  }
}

const tmp = path.join(tmpdir(), `interest-shell-${Date.now()}.json`);
writeFileSync(tmp, JSON.stringify(shell));
try {
  execFileSync(
    "npx",
    [
      "wrangler",
      "kv",
      "key",
      "put",
      "shell",
      "--binding",
      "INTEREST_SETTINGS",
      "--path",
      tmp,
      "--remote",
    ],
    { stdio: "inherit", shell: true }
  );
  console.log("Seeded INTEREST_SETTINGS KV key `shell`");
} finally {
  unlinkSync(tmp);
}
