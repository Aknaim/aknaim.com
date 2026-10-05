"use server";

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
import {
  localMediaFolderIsEmpty,
  relocateLocalMediaUrl,
  removeLocalMediaFolder,
} from "@/lib/media/storage";
import { ensureMediaAssetId } from "./media";
import { requireAdminAction } from "./require-admin";

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

export async function createOrUpdateClimbingSend(formData: FormData) {
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

  if (!routeName || !slug || !grade || !locationId || !sessionDate || !stillUrlInput) {
    throw new Error("Route name, grade, location, date, and still image are required.");
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
    throw new Error(
      `A climb named "${routeName}" already exists. Use a unique route name.`
    );
  }

  if (slugChanged) {
    const [slugConflict] = await db
      .select({ slug: climbingSends.slug })
      .from(climbingSends)
      .where(eq(climbingSends.slug, slug))
      .limit(1);
    if (slugConflict) {
      throw new Error(
        `Another climb already uses folder id "${slug}". Change the name or color.`
      );
    }
  }

  const climbFolder = `climbing/${slug}`;

  async function settleAsset(
    url: string,
    fileName: string,
    existingId: string,
    alt: string,
    mediaType: "image" | "video" = "image"
  ): Promise<{ id: string; url: string }> {
    const finalUrl = await relocateLocalMediaUrl(url, climbFolder, fileName);

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
  redirect(`/admin/climbing/${slug}`);
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

export async function deleteClimbingSend(formData: FormData) {
  await requireAdminAction();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  await db.delete(galleryItems).where(eq(galleryItems.id, `climb-${slug}-still`));
  await db.delete(galleryItems).where(eq(galleryItems.id, `climb-${slug}-grade`));
  await db.delete(galleryItems).where(eq(galleryItems.id, `climb-${slug}-send`));
  await db.delete(climbingSends).where(eq(climbingSends.slug, slug));

  revalidatePath("/climbing");
  revalidatePath("/gallery/climbing");
  revalidatePath("/admin/climbing");
  redirect("/admin/climbing");
}
