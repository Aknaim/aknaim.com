import type { Metadata } from "next";
import { RecipeAdminForm } from "@/components/sections/admin/RecipeAdminForm";

export const metadata: Metadata = {
  title: "New Recipe",
};

export default function NewRecipePage() {
  return (
    <main className="space-y-6">
      <h1 className="font-display text-3xl font-light text-white">New recipe</h1>
      <RecipeAdminForm />
    </main>
  );
}
