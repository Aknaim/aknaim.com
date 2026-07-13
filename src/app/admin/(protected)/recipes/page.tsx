import type { Metadata } from "next";
import Link from "next/link";
import { deleteRecipe } from "@/lib/actions/admin/recipes";
import { getAllRecipes } from "@/lib/db/queries/recipes";

export const metadata: Metadata = {
  title: "Admin Recipes",
};

export default async function AdminRecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <main className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Recipes</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Create and edit recipes stored in Postgres.
          </p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
        >
          New recipe
        </Link>
      </div>

      <ul className="divide-y divide-[#141414] border border-[#141414]">
        {recipes.map((recipe) => (
          <li key={recipe.slug} className="flex items-center justify-between gap-4 px-4 py-3">
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
        ))}
      </ul>
    </main>
  );
}
