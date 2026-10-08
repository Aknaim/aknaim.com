"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isIsoDate } from "@/lib/dates";
import { getCourseDefinition } from "@/lib/db/queries/courses";
import { db } from "@/lib/db";
import { courseCompletions } from "@/lib/db/schema";
import { requireAdminAction } from "./require-admin";

export type CourseSaveState = { error: string } | null;

function parseOptionalIso(
  value: FormDataEntryValue | null,
  label: string
): string | null | { error: string } {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!isIsoDate(raw)) return { error: `${label} must be a valid calendar date.` };
  return raw;
}

export async function saveCourseCompletion(
  _prev: CourseSaveState,
  formData: FormData
): Promise<CourseSaveState> {
  await requireAdminAction();

  const id = String(formData.get("id") ?? "").trim();
  if (!getCourseDefinition(id)) {
    return { error: "Unknown course." };
  }

  const startedParsed = parseOptionalIso(formData.get("startedOn"), "Start date");
  if (startedParsed && typeof startedParsed === "object" && "error" in startedParsed) {
    return startedParsed;
  }
  const completedParsed = parseOptionalIso(formData.get("completedOn"), "End date");
  if (completedParsed && typeof completedParsed === "object" && "error" in completedParsed) {
    return completedParsed;
  }

  const startedOn = startedParsed;
  const completedOn = completedParsed;

  if (startedOn && completedOn && startedOn > completedOn) {
    return { error: "Start date must be on or before the end date." };
  }

  await db
    .insert(courseCompletions)
    .values({
      id,
      startedOn,
      completedOn,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: courseCompletions.id,
      set: {
        startedOn,
        completedOn,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidateCoursePublicPages();

  redirect(`/admin/courses/${id}?saved=1`);
}

/** Bust stale ISR for all public course pages (R2 long-lived cache). */
function revalidateCoursePublicPages() {
  revalidatePath("/photography");
  revalidatePath("/cooking");
  revalidatePath("/carpentry");
  revalidatePath("/languages");
}

export async function refreshCoursePublicPages() {
  await requireAdminAction();
  revalidateCoursePublicPages();
  redirect("/admin/courses?refreshed=1");
}
