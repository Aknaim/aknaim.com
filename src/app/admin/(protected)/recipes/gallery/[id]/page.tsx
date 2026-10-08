import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CookingGalleryItemForm } from "@/components/sections/admin/CookingGalleryItemForm";
import { getAdminGalleryItem } from "@/lib/db/queries/admin-gallery";

export const metadata: Metadata = {
  title: "Edit Cooking Photo",
};

export default async function AdminCookingGalleryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAdminGalleryItem(id);
  if (!item || item.interest !== "cooking") notFound();

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/recipes"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Cooking
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          Edit {item.title || "photo"}
        </h1>
      </div>
      <CookingGalleryItemForm item={item} />
    </main>
  );
}
