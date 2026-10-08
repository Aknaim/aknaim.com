import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Flame, Gauge, Users } from "lucide-react";
import { RecipeFinalGallery } from "@/components/sections/cooking/RecipeFinalGallery";
import { RecipeIngredients } from "@/components/sections/cooking/RecipeIngredients";
import { RecipeSidebar } from "@/components/sections/cooking/RecipeSidebar";
import { RecipeSteps } from "@/components/sections/cooking/RecipeSteps";
import {
  getCookingGalleryHref,
  getRecipeBySlug,
  getRecipeSlugs,
} from "@/lib/db/queries/recipes";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getRecipeSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe Not Found" };
  return { title: recipe.title };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const quickStats = [
    { icon: Users, label: `${recipe.quickStats.servings} Servings` },
    { icon: Clock, label: `${recipe.quickStats.totalTime} Total Time` },
    { icon: Gauge, label: `${recipe.quickStats.difficulty} Difficulty` },
    ...(recipe.quickStats.ovenTemp
      ? [{ icon: Flame, label: `${recipe.quickStats.ovenTemp} Oven Temp` }]
      : []),
  ];

  return (
    <main className="min-h-screen bg-[#070707] text-[#eaeaea] font-body pb-24 selection:bg-accent/30 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-12">
        <Link
          href="/cooking"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors group mb-8"
        >
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span>
          Cooking
        </Link>

        <header className="space-y-4 mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-light tracking-tight text-white max-w-3xl">
            {recipe.title}
          </h1>
          <p className="text-foreground-muted text-sm leading-relaxed max-w-2xl">
            {recipe.description}
          </p>
          <div className="flex flex-wrap gap-6 pt-4 border-t border-[#141414]">
            {quickStats.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-accent/80" strokeWidth={1.5} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </header>

        <div className="relative aspect-[21/9] w-full rounded-card border border-[#141414] overflow-hidden bg-[#0c0c0c] mb-12">
          <Image
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          <div className="lg:col-span-7">
            <RecipeIngredients
              groups={recipe.ingredients}
              baseServings={recipe.quickStats.servings}
            />
          </div>
          <div className="lg:col-span-5">
            <RecipeSidebar recipe={recipe} />
          </div>
        </div>

        <div className="mb-16">
          <RecipeSteps steps={recipe.steps} />
        </div>

        <RecipeFinalGallery images={recipe.finalResultImages} recipeTitle={recipe.title} />

        <div className="mt-12 pt-8 border-t border-[#141414]">
          <Link
            href={getCookingGalleryHref()}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-subtle hover:text-accent transition-colors group"
          >
            Browse gallery
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
