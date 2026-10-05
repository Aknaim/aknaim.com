import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryAdminForm } from "@/components/sections/admin/GalleryAdminForm";
import { getAdminGalleryItem } from "@/lib/db/queries/admin-gallery";

export const metadata: Metadata = {
  title: "Edit Gallery Item",
};

export default async function AdminGalleryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAdminGalleryItem(id);
  if (!item) notFound();

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/gallery"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Gallery
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          Edit {item.title || item.id}
        </h1>
      </div>
      <GalleryAdminForm item={item} />
    </main>
  );
}
