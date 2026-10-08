import { siteData } from "@/lib/data";
import type { ActivityStatus, InterestId } from "@/types";

export type InterestShell = {
  status: ActivityStatus;
  workbenchNote: string | null;
  lastActive: string | null;
};

export type InterestShellMap = Record<InterestId, InterestShell>;

const KV_KEY = "shell";

export function shellFromSiteData(): InterestShellMap {
  const map = {} as InterestShellMap;
  for (const interest of siteData.interests) {
    map[interest.id] = {
      status: interest.status,
      workbenchNote: interest.workbenchNote ?? null,
      lastActive: interest.lastActive ?? null,
    };
  }
  return map;
}

async function getInterestSettingsKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env.INTEREST_SETTINGS ?? null;
  } catch {
    return null;
  }
}

/** Edge KV first (Worker-safe). Falls back to static siteData — never Neon. */
export async function readInterestShellMap(): Promise<InterestShellMap> {
  const fallback = shellFromSiteData();
  const kv = await getInterestSettingsKv();
  if (!kv) return fallback;

  try {
    const stored = await kv.get<InterestShellMap>(KV_KEY, "json");
    if (!stored || typeof stored !== "object") return fallback;
    // Per-id merge so newly added interests keep siteData defaults when KV
    // was published before they existed (spread alone left stale gaps).
    const merged = { ...fallback };
    for (const id of Object.keys(fallback) as InterestId[]) {
      const override = stored[id];
      if (!override || typeof override !== "object") continue;
      merged[id] = {
        status: override.status ?? fallback[id].status,
        workbenchNote:
          override.workbenchNote !== undefined
            ? override.workbenchNote
            : fallback[id].workbenchNote,
        lastActive:
          override.lastActive !== undefined
            ? override.lastActive
            : fallback[id].lastActive,
      };
    }
    return merged;
  } catch {
    return fallback;
  }
}

export async function writeInterestShellMap(map: InterestShellMap): Promise<void> {
  const kv = await getInterestSettingsKv();
  if (!kv) return;
  await kv.put(KV_KEY, JSON.stringify(map));
}
