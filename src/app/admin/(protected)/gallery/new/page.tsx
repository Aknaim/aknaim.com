import type { Metadata } from "next";
import Link from "next/link";
import { GalleryAdminForm } from "@/components/sections/admin/GalleryAdminForm";

export const metadata: Metadata = {
  title: "New Gallery Item",
};

export default function AdminGalleryNewPage() {
  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/gallery"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Gallery
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">New gallery item</h1>
      </div>
      <GalleryAdminForm />
    </main>
  );
}
