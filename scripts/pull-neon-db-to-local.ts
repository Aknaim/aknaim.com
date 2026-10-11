/**
 * Copy Neon production → local Docker Postgres.
 *
 * Requires Docker Desktop. Uses:
 *   DATABASE_URL (local Docker — overwritten)
 *   DATABASE_URL_NEON_PRODUCTION (Neon source)
 *
 * Does not rewrite media URLs (keeps https://media.aknaim.com/… like prod).
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

function cleanUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function run(cmd: string, args: string[], opts?: { allowExit1?: boolean }) {
  // Never shell:true — Neon URLs contain & which Windows cmd splits.
  console.log(
    `$ ${cmd} ${args.map((a) => (a.includes("://") ? "[url]" : a)).join(" ")}`
  );
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  const code = result.status ?? 1;
  if (code !== 0) {
    if (opts?.allowExit1 && code === 1) {
      console.warn("Command exited 1 (often non-fatal for pg_restore); continuing…");
      return;
    }
    throw new Error(`${cmd} failed with exit ${code}`);
  }
}

async function main() {
  const localUrl = cleanUrl(process.env.DATABASE_URL);
  const neonUrl = cleanUrl(process.env.DATABASE_URL_NEON_PRODUCTION);
  const dbUser = process.env.POSTGRES_USER?.trim() || "aknaim";
  const dbName = process.env.POSTGRES_DB?.trim() || "aknaim";

  if (!localUrl) throw new Error("DATABASE_URL (local) is required");
  if (!neonUrl) throw new Error("DATABASE_URL_NEON_PRODUCTION is required");
  if (localUrl.includes("neon.tech") || localUrl.includes("neon.database")) {
    throw new Error("DATABASE_URL must point at local Docker, not Neon");
  }
  if (!neonUrl.includes("neon.tech") && !neonUrl.includes("neon.database")) {
    throw new Error("DATABASE_URL_NEON_PRODUCTION must be a Neon URL");
  }

  // Prefer direct (non-pooler) for dump when available.
  const neonDumpUrl = neonUrl.includes("-pooler.")
    ? neonUrl.replace("-pooler.", ".")
    : neonUrl;
  const neonWithSsl = neonDumpUrl.includes("sslmode=")
    ? neonDumpUrl
    : `${neonDumpUrl}${neonDumpUrl.includes("?") ? "&" : "?"}sslmode=require`;

  const dir = mkdtempSync(path.join(tmpdir(), "aknaim-neon-"));
  const dumpHost = path.join(dir, "neon.dump");

  try {
    console.log("1/2 Dumping Neon production…");
    // Neon runs Postgres 18 — pg_dump must be ≥ server major version.
    run("docker", [
      "run",
      "--rm",
      "-v",
      `${dir}:/dump`,
      "postgres:18-alpine",
      "pg_dump",
      `--dbname=${neonWithSsl}`,
      "-Fc",
      "--no-owner",
      "--no-acl",
      "-f",
      "/dump/neon.dump",
    ]);

    const size = statSync(dumpHost).size;
    console.log(`Dump size: ${size} bytes`);
    if (size < 1000) {
      throw new Error("Dump file looks empty — aborting before touching local DB");
    }

    console.log("2/2 Restoring dump into local Docker Postgres…");
    run("docker", [
      "compose",
      "-f",
      "docker-compose.dev.yml",
      "cp",
      dumpHost,
      "db:/tmp/aknaim-neon.dump",
    ]);
    run(
      "docker",
      [
        "compose",
        "-f",
        "docker-compose.dev.yml",
        "exec",
        "-T",
        "db",
        "pg_restore",
        "-U",
        dbUser,
        "-d",
        dbName,
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-acl",
        "/tmp/aknaim-neon.dump",
      ],
      { allowExit1: true }
    );

    console.log("Done. Local Docker now mirrors Neon production data.");
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
