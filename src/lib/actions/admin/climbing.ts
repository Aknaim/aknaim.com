"use server";

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  climbingProjects,
  climbingSends,
  climbingSessions,
  galleryItems,
  mediaAssets,
} from "@/lib/db/schema";
import { gradeFilterKey } from "@/lib/climbing-grades";
import { ensureMediaAssetId } from "./ensure-media-asset";
import { requireAdminAction } from "./require-admin";

async function mediaStorage() {
  return import("@/lib/media/storage");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDateLabel(dateTaken: string): string {
  const date = new Date(`${dateTaken}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateTaken;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type ClimbSendSaveState = { error: string } | null;

export async function createOrUpdateClimbingSend(
  _prev: ClimbSendSaveState,
  formData: FormData
): Promise<ClimbSendSaveState> {
  await requireAdminAction();

  const routeName = String(formData.get("routeName") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || null;
  // Folder/id always follows current name + color (e.g. halloween-3-red).
  const previousSlug = slugify(String(formData.get("existingSlug") ?? "").trim());
  const slug = slugify(`${routeName}${color ? `-${color}` : ""}`);
  const grade = String(formData.get("grade") ?? "").trim();
  const locationId = String(formData.get("locationId") ?? "").trim();
  const type = String(formData.get("type") ?? "top-rope") as
    | "lead"
    | "bouldering"
    | "top-rope";
  const result = String(formData.get("result") ?? "send") as
    | "onsight"
    | "flash"
    | "redpoint"
    | "send"
    | "one-hang"
    | "project";
  const sessionDate = String(formData.get("sessionDate") ?? "").trim();
  const durationLabel = String(formData.get("durationLabel") ?? "").trim() || null;
  const stillUrlInput = String(formData.get("stillUrl") ?? "").trim();
  const stillMediaIdInput = String(formData.get("stillMediaId") ?? "").trim();
  const gradeUrlInput = String(formData.get("gradeUrl") ?? "").trim();
  const gradeMediaIdInput = String(formData.get("gradeMediaId") ?? "").trim();
  const videoUrlInput = String(formData.get("videoUrl") ?? "").trim();
  const videoMediaIdInput = String(formData.get("videoMediaId") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const slugChanged = Boolean(previousSlug && previousSlug !== slug);

  const missing: string[] = [];
  if (!routeName) missing.push("route name");
  if (!slug) missing.push("route name (for folder id)");
  if (!grade) missing.push("grade");
  if (!locationId) missing.push("location");
  if (!sessionDate) missing.push("session date");
  if (!stillUrlInput) {
    missing.push("photo (upload a still, or a send video and wait for the auto poster)");
  }
  if (missing.length > 0) {
    return { error: `Missing required fields: ${missing.join(", ")}.` };
  }

  const [nameConflict] = await db
    .select({ slug: climbingSends.slug })
    .from(climbingSends)
    .where(
      and(
        sql`lower(${climbingSends.routeName}) = lower(${routeName})`,
        ne(climbingSends.slug, previousSlug || slug)
      )
    )
    .limit(1);

  if (nameConflict) {
    return {
      error: `A climb named "${routeName}" already exists. Use a unique route name.`,
    };
  }

  if (slugChanged) {
    const [slugConflict] = await db
      .select({ slug: climbingSends.slug })
      .from(climbingSends)
      .where(eq(climbingSends.slug, slug))
      .limit(1);
    if (slugConflict) {
      return {
        error: `Another climb already uses folder id "${slug}". Change the name or color.`,
      };
    }
  }

  try {
  const climbFolder = `climbing/${slug}`;

  async function settleAsset(
    url: string,
    fileName: string,
    existingId: string,
    alt: string,
    mediaType: "image" | "video" = "image"
  ): Promise<{ id: string; url: string }> {
    // Move into climbing/<slug>/… on save (local disk or R2).
    // Avoid static storage imports — only load when needed.
    let finalUrl = url;
    if (url.startsWith("/media/")) {
      const { relocateLocalMediaUrl } = await mediaStorage();
      finalUrl = await relocateLocalMediaUrl(url, climbFolder, fileName);
    } else {
      try {
        const { getR2PublicBaseUrl, relocateR2PublicUrl } = await import(
          "@/lib/media/r2"
        );
        if (url.startsWith(`${getR2PublicBaseUrl()}/`)) {
          finalUrl = await relocateR2PublicUrl(url, climbFolder, fileName);
        }
      } catch {
        // R2 not configured or copy failed — keep original URL.
        finalUrl = url;
      }
    }

    const [owner] = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.url, finalUrl))
      .limit(1);

    // Destination URL already claimed (retry / rename / re-upload) — reuse it.
    if (owner) {
      return { id: owner.id, url: finalUrl };
    }

    if (existingId) {
      if (finalUrl !== url) {
        await db
          .update(mediaAssets)
          .set({ url: finalUrl })
          .where(eq(mediaAssets.id, existingId));
      }
      return { id: existingId, url: finalUrl };
    }
    const id = await ensureMediaAssetId(finalUrl, alt, mediaType);
    return { id, url: finalUrl };
  }

  const still = await settleAsset(
    stillUrlInput,
    "still.webp",
    stillMediaIdInput,
    `${routeName} still`
  );
  const stillMediaId = still.id;
  const stillUrl = still.url;

  // Grade card is optional. Same URL as the photo = no separate grade asset.
  const wantsSeparateGrade =
    Boolean(gradeUrlInput) && gradeUrlInput !== stillUrlInput && gradeUrlInput !== stillUrl;

  const gradeSettled = wantsSeparateGrade
    ? await settleAsset(
        gradeUrlInput,
        "grade.webp",
        gradeMediaIdInput,
        `${routeName} grade`
      )
    : null;
  const gradeMediaId = gradeSettled?.id ?? null;

  const videoSettled = videoUrlInput
    ? await settleAsset(
        videoUrlInput,
        "send.mp4",
        videoMediaIdInput,
        `${routeName} send`,
        "video"
      )
    : null;
  const videoMediaId = videoSettled?.id ?? null;

  if (slugChanged && previousSlug) {
    // Drop old gallery/send ids so the climb can be re-created under the new folder id.
    await db.delete(galleryItems).where(
      inArray(galleryItems.id, [
        `climb-${previousSlug}-still`,
        `climb-${previousSlug}-grade`,
        `climb-${previousSlug}-send`,
      ])
    );
    await db.delete(climbingSends).where(eq(climbingSends.slug, previousSlug));

    const oldFolder = `climbing/${previousSlug}`;
    const { localMediaFolderIsEmpty, removeLocalMediaFolder } = await mediaStorage();
    if (await localMediaFolderIsEmpty(oldFolder)) {
      await removeLocalMediaFolder(oldFolder);
    } else {
      // Files should already have been relocated; remove leftovers.
      await removeLocalMediaFolder(oldFolder);
    }
  }

  const sessionId = `session-${sessionDate}-${locationId}`;
  await db
    .insert(climbingSessions)
    .values({
      id: sessionId,
      sessionDate,
      locationId,
      notes: null,
    })
    .onConflictDoUpdate({
      target: climbingSessions.id,
      set: { sessionDate, locationId },
    });

  const sendId = `send-${slug}`;
  await db
    .insert(climbingSends)
    .values({
      id: sendId,
      slug,
      grade,
      routeName,
      locationId,
      type,
      color,
      result,
      sessionId,
      sendDateLabel: formatDateLabel(sessionDate),
      durationLabel: durationLabel || "—",
      imageMediaId: stillMediaId,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .onConflictDoUpdate({
      target: climbingSends.slug,
      set: {
        grade,
        routeName,
        locationId,
        type,
        color,
        result,
        sessionId,
        sendDateLabel: formatDateLabel(sessionDate),
        durationLabel: durationLabel || "—",
        imageMediaId: stillMediaId,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });

  const filters = {
    location: locationId,
    type,
    grade: gradeFilterKey(grade),
    ...(color ? { color } : {}),
    result,
    climb: slug,
  };

  const galleryRows = [
    {
      id: `climb-${slug}-still`,
      mediaAssetId: stillMediaId,
      title: routeName,
      alt: `${routeName} — still`,
      durationLabel: null as string | null,
    },
    ...(gradeMediaId
      ? [
          {
            id: `climb-${slug}-grade`,
            mediaAssetId: gradeMediaId,
            title: routeName,
            alt: `${routeName} — grade`,
            durationLabel: null as string | null,
          },
        ]
      : []),
    ...(videoMediaId
      ? [
          {
            id: `climb-${slug}-send`,
            mediaAssetId: videoMediaId,
            title: routeName,
            alt: `${routeName} — send`,
            durationLabel,
          },
        ]
      : []),
  ];

  for (const [index, row] of galleryRows.entries()) {
    await db
      .update(mediaAssets)
      .set({ alt: row.alt })
      .where(eq(mediaAssets.id, row.mediaAssetId));

    await db
      .insert(galleryItems)
      .values({
        id: row.id,
        interest: "climbing",
        mediaAssetId: row.mediaAssetId,
        title: row.title,
        dateTaken: sessionDate,
        filters,
        durationLabel: row.durationLabel,
        sortOrder: index,
        published: true,
      })
      .onConflictDoUpdate({
        target: galleryItems.id,
        set: {
          mediaAssetId: row.mediaAssetId,
          title: row.title,
          dateTaken: sessionDate,
          filters,
          durationLabel: row.durationLabel,
          sortOrder: index,
          published: true,
        },
      });
  }

  if (videoMediaId) {
    await db
      .update(mediaAssets)
      .set({
        posterUrl: stillUrl || null,
        durationLabel,
        mediaType: "video",
      })
      .where(eq(mediaAssets.id, videoMediaId));
  }

  revalidatePath("/climbing");
  revalidatePath("/gallery/climbing");
  revalidatePath("/admin/climbing");
  revalidatePath(`/admin/climbing/${slug}`);
  redirect(`/admin/climbing/${slug}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message =
      error instanceof Error ? error.message : "Could not save climb.";
    return { error: message };
  }
}

export async function createOrUpdateClimbingProject(formData: FormData) {
  await requireAdminAction();

  const name = String(formData.get("name") ?? "").trim();
  const idInput = String(formData.get("id") ?? "").trim();
  const id = idInput || slugify(name);
  const grade = String(formData.get("grade") ?? "").trim();
  const locationId = String(formData.get("locationId") ?? "").trim();
  const type = String(formData.get("type") ?? "lead") as
    | "lead"
    | "bouldering"
    | "top-rope";
  const status = String(formData.get("status") ?? "projecting") as
    | "in-progress"
    | "projecting"
    | "on-deck";
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageMediaIdInput = String(formData.get("imageMediaId") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!name || !grade || !locationId || (!imageUrl && !imageMediaIdInput)) {
    throw new Error("Name, grade, location, and image are required.");
  }

  const imageMediaId =
    imageMediaIdInput || (await ensureMediaAssetId(imageUrl, name));

  await db
    .insert(climbingProjects)
    .values({
      id,
      grade,
      name,
      locationId,
      type,
      status,
      imageMediaId,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .onConflictDoUpdate({
      target: climbingProjects.id,
      set: {
        grade,
        name,
        locationId,
        type,
        status,
        imageMediaId,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });

  revalidatePath("/climbing");
  revalidatePath("/admin/climbing");
  redirect("/admin/climbing");
}

