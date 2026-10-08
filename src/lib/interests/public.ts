import { siteData } from "@/lib/data";
import {
  readInterestShellMap,
  type InterestShellMap,
} from "@/lib/interests/shell";
import type { InterestCategory } from "@/types";

function byLabel(a: InterestCategory, b: InterestCategory): number {
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
}

/** Shelf payload only — drop heavy tabs before sending to client components. */
export function toShelfInterest(interest: InterestCategory): InterestCategory {
  return { ...interest, tabs: [] };
}

function mergeShell(shell: InterestShellMap): InterestCategory[] {
  return siteData.interests.map((interest) => {
    const override = shell[interest.id];
    if (!override) return interest;
    return {
      ...interest,
      status: override.status,
      workbenchNote: override.workbenchNote ?? undefined,
      lastActive: override.lastActive ?? undefined,
    };
  });
}

/**
 * Public home path: KV + static siteData only.
 * Neon stays in admin queries (Workers CPU limits).
 */
export async function getWorkbenchInterestLists(): Promise<{
  active: InterestCategory[];
  dormant: InterestCategory[];
}> {
  const shell = await readInterestShellMap();
  const interests = mergeShell(shell);
  return {
    active: interests
      .filter((interest) => interest.status === "active")
      .sort(byLabel)
      .map(toShelfInterest),
    dormant: interests
      .filter((interest) => interest.status === "dormant")
      .sort(byLabel)
      .map(toShelfInterest),
  };
}
