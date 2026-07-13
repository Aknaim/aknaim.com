import "dotenv/config";
import { getGalleryItems } from "../src/lib/db/queries/gallery";
import { getAllRecipes, getCookingStats } from "../src/lib/db/queries/recipes";

async function main() {
  const recipes = await getAllRecipes();
  const stats = await getCookingStats();
  const gallery = await getGalleryItems("cooking");
  console.log(
    JSON.stringify(
      {
        recipeCount: recipes.length,
        titles: recipes.map((r) => r.title),
        stats,
        cookingGalleryCount: gallery.length,
      },
      null,
      2
    )
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
