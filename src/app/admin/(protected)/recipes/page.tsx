import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CookingGalleryDumpForm } from "@/components/sections/admin/CookingGalleryDumpForm";
import { deleteGalleryItem } from "@/lib/actions/admin/gallery";
import { deleteRecipe } from "@/lib/actions/admin/recipes";
import { listAdminGalleryItems } from "@/lib/db/queries/admin-gallery";
import { listRecipesForAdmin } from "@/lib/db/queries/recipes";

export const metadata: Metadata = {
  title: "Admin Cooking",
};

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const photosRaw = typeof params.photos === "string" ? params.photos : "";
  const photosCount = Number(photosRaw);

  const [recipes, cookingPhotos] = await Promise.all([
    listRecipesForAdmin(),
    listAdminGalleryItems("cooking"),
  ]);

  return (
    <main className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Cooking</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Recipes, plus gallery plates that don’t need a full write-up.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/gallery/cooking"
            className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-foreground-muted hover:text-white hover:border-accent transition-colors"
          >
            View gallery
          </Link>
          <Link
            href="/admin/recipes/new"
            className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
          >
            New recipe
          </Link>
        </div>
      </div>

      {Number.isFinite(photosCount) && photosCount > 0 ? (
        <p className="font-mono text-[11px] text-accent/90 border border-accent/30 bg-accent/10 px-4 py-3">
          Added {photosCount} cooking gallery photo{photosCount === 1 ? "" : "s"}.
        </p>
      ) : null}

      <CookingGalleryDumpForm />

      <section className="space-y-4">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Gallery photos
        </h2>
        <ul className="divide-y divide-[#141414] border border-[#141414]">
          {cookingPhotos.length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">
              No gallery photos yet — use the dump above.
            </li>
          ) : (
            cookingPhotos.map((photo) => (
              <li
                key={photo.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 border border-[#262626] bg-[#0c0c0c] overflow-hidden">
                    <Image
                      src={photo.mediaUrl}
                      alt={photo.title || "Cooking photo"}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/recipes/gallery/${photo.id}`}
                      className="text-sm text-white hover:text-accent transition-colors"
                    >
                      {photo.title || photo.id}
                    </Link>
                    <div className="font-mono text-[10px] text-foreground-muted mt-1">
                      {photo.dateTaken}
                      {photo.filters.category ? ` · ${photo.filters.category}` : ""}
                      {photo.filters.cuisine ? ` · ${photo.filters.cuisine}` : ""}
                      {photo.published ? "" : " · draft"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/admin/recipes/gallery/${photo.id}`}
                    className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
                  >
                    Edit
                  </Link>
                  <form action={deleteGalleryItem}>
                    <input type="hidden" name="id" value={photo.id} />
                    <input type="hidden" name="returnTo" value="/admin/recipes" />
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
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Recipes
        </h2>
        <ul className="divide-y divide-[#141414] border border-[#141414]">
          {recipes.length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">
              No recipes yet — use New recipe when you want a full write-up.
            </li>
          ) : (
            recipes.map((recipe) => (
              <li
                key={recipe.slug}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/admin/recipes/${recipe.slug}`}
                    className="text-sm text-white hover:text-accent transition-colors"
                  >
                    {recipe.title}
                  </Link>
                  <div className="font-mono text-[10px] text-foreground-muted mt-1">
                    {recipe.slug} · {recipe.category} · {recipe.cuisine}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/cooking/${recipe.slug}`}
                    className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
                  >
                    View
                  </Link>
                  <form action={deleteRecipe}>
                    <input type="hidden" name="slug" value={recipe.slug} />
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
      </section>
    </main>
  );
}
