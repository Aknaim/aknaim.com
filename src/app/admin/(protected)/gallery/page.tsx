import type { Metadata } from "next";
import Link from "next/link";
import { deleteGalleryItem } from "@/lib/actions/admin/gallery";
import { listAdminGalleryItems } from "@/lib/db/queries/admin-gallery";

export const metadata: Metadata = {
  title: "Admin Gallery",
};

export default async function AdminGalleryPage() {
  const items = await listAdminGalleryItems();

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Gallery</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Edit or delete existing gallery items.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors w-fit"
        >
          New item
        </Link>
      </div>

      <ul className="divide-y divide-[#141414] border border-[#141414]">
        {items.length === 0 ? (
          <li className="px-4 py-6 text-sm text-foreground-muted">No gallery items yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <Link
                  href={
                    item.interest === "cooking"
                      ? `/admin/recipes/gallery/${item.id}`
                      : `/admin/gallery/${item.id}`
                  }
                  className="text-sm text-white hover:text-accent transition-colors"
                >
                  {item.title || item.id}
                </Link>
                <div className="font-mono text-[10px] text-foreground-muted mt-1">
                  {item.interest} · {item.dateTaken}
                  {item.durationLabel ? ` · ${item.durationLabel}` : ""} ·{" "}
                  {item.published ? "published" : "draft"}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/gallery/${item.interest}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
                >
                  View
                </Link>
                <form action={deleteGalleryItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="returnTo" value="/admin/gallery" />
                  <button
                    type="submit"
                    className="font-mono text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
