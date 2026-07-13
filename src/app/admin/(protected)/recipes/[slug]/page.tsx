import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeAdminForm } from "@/components/sections/admin/RecipeAdminForm";
import { getRecipeBySlug } from "@/lib/db/queries/recipes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  return { title: recipe ? `Edit ${recipe.title}` : "Recipe" };
}

export default async function EditRecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <main className="space-y-6">
      <h1 className="font-display text-3xl font-light text-white">Edit recipe</h1>
      <RecipeAdminForm recipe={recipe} />
    </main>
  );
}
