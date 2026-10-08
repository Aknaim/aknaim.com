"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { interestSettings } from "@/lib/db/schema";
import {
  isInterestId,
  publishInterestShellToKv,
} from "@/lib/db/queries/interests";
import { isIsoDate } from "@/lib/dates";
import type { ActivityStatus } from "@/types";
import { requireAdminAction } from "./require-admin";

export type InterestSaveState = { error: string } | null;

function parseStatus(value: FormDataEntryValue | null): ActivityStatus | null {
  if (value === "active" || value === "dormant") return value;
  return null;
}

function parseOptionalIsoDate(value: FormDataEntryValue | null): string | null | { error: string } {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!isIsoDate(raw)) return { error: "Last active must be a valid date." };
  return raw;
}

export async function saveInterestSettings(
  _prev: InterestSaveState,
  formData: FormData
): Promise<InterestSaveState> {
  await requireAdminAction();

  const id = String(formData.get("id") ?? "").trim();
  if (!isInterestId(id)) {
    return { error: "Unknown interest." };
  }

  const status = parseStatus(formData.get("status"));
  if (!status) {
    return { error: "Status must be active or dormant." };
  }

  const workbenchNote = String(formData.get("workbenchNote") ?? "").trim() || null;
  const lastActiveParsed = parseOptionalIsoDate(formData.get("lastActive"));
  if (lastActiveParsed && typeof lastActiveParsed === "object" && "error" in lastActiveParsed) {
    return lastActiveParsed;
  }
  const lastActive = lastActiveParsed;

  await db
    .insert(interestSettings)
    .values({
      id,
      status,
      workbenchNote,
      lastActive,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: interestSettings.id,
      set: {
        status,
        workbenchNote,
        lastActive,
        updatedAt: new Date(),
      },
    });

  try {
    await publishInterestShellToKv();
  } catch {
    // Local/dev may lack the binding; Neon remains source of truth for admin.
  }

  revalidatePath("/");
  revalidatePath(`/interests/${id}`);
  revalidatePath("/admin/interests");
  revalidatePath(`/admin/interests/${id}`);

  redirect(`/admin/interests/${id}?saved=1`);
}
