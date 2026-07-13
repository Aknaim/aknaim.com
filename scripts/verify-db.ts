import "dotenv/config";
import { getClimbingGearItems, getClimbingProgression, getClimbingProjects, getClimbingStats } from "../src/lib/db/queries/climbing";
import { getGalleryItems } from "../src/lib/db/queries/gallery";
import { getAllRecipes, getCookingStats } from "../src/lib/db/queries/recipes";

async function main() {
  const recipes = await getAllRecipes();
  const cookingStats = await getCookingStats();
  const cookingGallery = await getGalleryItems("cooking");
  const climbingStats = await getClimbingStats();
  const climbingProjects = await getClimbingProjects();
  const climbingGear = await getClimbingGearItems();
  const climbingProgression = await getClimbingProgression();
  const climbingGallery = await getGalleryItems("climbing");

  console.log(
    JSON.stringify(
      {
        cooking: {
          recipeCount: recipes.length,
          stats: cookingStats,
          galleryCount: cookingGallery.length,
        },
        climbing: {
          stats: climbingStats,
          projectCount: climbingProjects.length,
          projectNames: climbingProjects.map((p) => p.name),
          gearCount: climbingGear.length,
          progressionCount: climbingProgression.length,
          galleryCount: climbingGallery.length,
        },
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
