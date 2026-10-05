import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ClimbSendAdminForm } from "@/components/sections/admin/ClimbSendAdminForm";
import { db } from "@/lib/db";
import { galleryItems, mediaAssets } from "@/lib/db/schema";
import {
  getClimbingLocations,
  getClimbingSendBySlug,
} from "@/lib/db/queries/climbing";

export const metadata: Metadata = {
  title: "Edit Climb",
};

export default async function AdminClimbingEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [send, locations] = await Promise.all([
    getClimbingSendBySlug(slug),
    getClimbingLocations(),
  ]);
  if (!send) notFound();

  const mediaRows = await db
    .select({
      id: galleryItems.id,
      url: mediaAssets.url,
    })
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(eq(galleryItems.interest, "climbing"));

  const gradeUrl =
    mediaRows.find((row) => row.id === `climb-${slug}-grade`)?.url ?? "";
  const videoUrl =
    mediaRows.find((row) => row.id === `climb-${slug}-send`)?.url ?? "";

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/climbing"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Climbing
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          Edit {send.routeName}
        </h1>
      </div>
      <ClimbSendAdminForm
        send={send}
        locations={locations}
        gradeUrl={gradeUrl}
        videoUrl={videoUrl}
      />
    </main>
  );
}
