import { asc, eq } from "drizzle-orm";
import { siteData } from "@/lib/data";
import { db } from "@/lib/db";
import { interestSettings } from "@/lib/db/schema";
import {
  shellFromSiteData,
  writeInterestShellMap,
} from "@/lib/interests/shell";
import type { ActivityStatus, InterestId } from "@/types";

export type InterestSettingRow = {
  id: InterestId;
  status: ActivityStatus;
  workbenchNote: string | null;
  lastActive: string | null;
  updatedAt: Date;
  label: string;
};

const INTEREST_IDS = new Set(siteData.interests.map((interest) => interest.id));

export function isInterestId(value: string): value is InterestId {
  return INTEREST_IDS.has(value as InterestId);
}

export async function listInterestSettingsForAdmin(): Promise<InterestSettingRow[]> {
  const rows = await db
    .select({
      id: interestSettings.id,
      status: interestSettings.status,
      workbenchNote: interestSettings.workbenchNote,
      lastActive: interestSettings.lastActive,
      updatedAt: interestSettings.updatedAt,
    })
    .from(interestSettings)
    .orderBy(asc(interestSettings.id));

  const labelById = new Map(siteData.interests.map((i) => [i.id, i.label]));
  const seen = new Set(rows.map((row) => row.id));
  const merged: InterestSettingRow[] = rows
    .filter((row) => isInterestId(row.id))
    .map((row) => ({
      id: row.id as InterestId,
      status: row.status,
      workbenchNote: row.workbenchNote,
      lastActive: row.lastActive,
      updatedAt: row.updatedAt,
      label: labelById.get(row.id as InterestId) ?? row.id,
    }));

  for (const interest of siteData.interests) {
    if (seen.has(interest.id)) continue;
    merged.push({
      id: interest.id,
      status: interest.status,
      workbenchNote: interest.workbenchNote ?? null,
      lastActive: interest.lastActive ?? null,
      updatedAt: new Date(0),
      label: interest.label,
    });
  }

  return merged.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
  );
}

export async function getInterestSettingForAdmin(
  id: string
): Promise<InterestSettingRow | null> {
  if (!isInterestId(id)) return null;

  const staticInterest = siteData.interests.find((interest) => interest.id === id);
  if (!staticInterest) return null;

  const [row] = await db
    .select({
      id: interestSettings.id,
      status: interestSettings.status,
      workbenchNote: interestSettings.workbenchNote,
      lastActive: interestSettings.lastActive,
      updatedAt: interestSettings.updatedAt,
    })
    .from(interestSettings)
    .where(eq(interestSettings.id, id))
    .limit(1);

  if (!row) {
    return {
      id,
      status: staticInterest.status,
      workbenchNote: staticInterest.workbenchNote ?? null,
      lastActive: staticInterest.lastActive ?? null,
      updatedAt: new Date(0),
      label: staticInterest.label,
    };
  }

  return {
    id,
    status: row.status,
    workbenchNote: row.workbenchNote,
    lastActive: row.lastActive,
    updatedAt: row.updatedAt,
    label: staticInterest.label,
  };
}

/** After admin save: rebuild full shell map from Neon and publish to KV. */
export async function publishInterestShellToKv(): Promise<void> {
  const shell = shellFromSiteData();
  const rows = await db
    .select({
      id: interestSettings.id,
      status: interestSettings.status,
      workbenchNote: interestSettings.workbenchNote,
      lastActive: interestSettings.lastActive,
    })
    .from(interestSettings);

  for (const row of rows) {
    if (!isInterestId(row.id)) continue;
    shell[row.id] = {
      status: row.status,
      workbenchNote: row.workbenchNote,
      lastActive: row.lastActive,
    };
  }

  await writeInterestShellMap(shell);
}
