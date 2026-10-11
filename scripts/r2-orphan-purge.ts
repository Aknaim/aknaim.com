/**
 * Delete R2 keys listed in scripts/_tmp-r2-orphan-report.json (from media:r2-orphans).
 *
 * Usage:
 *   npx tsx scripts/r2-orphan-purge.ts           # dry-run
 *   npx tsx scripts/r2-orphan-purge.ts --apply   # delete listed orphans only
 */
import "dotenv/config";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
import path from "node:path";
import { isR2Configured } from "../src/lib/media/r2";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

type OrphanReport = {
  bucket: string;
  orphanCount: number;
  orphans: string[];
};

async function main() {
  const apply = process.argv.includes("--apply");
  if (!isR2Configured()) {
    throw new Error("R2_* env vars required");
  }

  const reportPath = path.join(
    process.cwd(),
    "scripts",
    "_tmp-r2-orphan-report.json"
  );
  const report = JSON.parse(readFileSync(reportPath, "utf8")) as OrphanReport;
  const keys = report.orphans ?? [];
  if (keys.length === 0) {
    console.log("No orphans in report.");
    return;
  }

  const bucket = requiredEnv("R2_BUCKET");
  if (report.bucket && report.bucket !== bucket) {
    throw new Error(
      `Report bucket (${report.bucket}) != R2_BUCKET (${bucket}) — aborting`
    );
  }

  console.log(
    `${apply ? "Deleting" : "Would delete"} ${keys.length} object(s) from ${bucket}`
  );
  for (const key of keys.slice(0, 10)) {
    console.log(`  ${key}`);
  }
  if (keys.length > 10) console.log(`  … +${keys.length - 10} more`);

  if (!apply) {
    console.log("Dry-run only. Re-run with --apply to delete.");
    return;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  let deleted = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000);
    const res = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
    if (res.Errors?.length) {
      for (const err of res.Errors) {
        console.error(`Failed ${err.Key}: ${err.Code} ${err.Message}`);
      }
      throw new Error(`Delete failed for ${res.Errors.length} object(s)`);
    }
    deleted += chunk.length;
  }

  console.log(`Deleted ${deleted} R2 object(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
