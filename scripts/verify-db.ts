import "dotenv/config";
import { getClimbingGearItems, getClimbingProgression, getClimbingProjects, getClimbingStats } from "../src/lib/db/queries/climbing";
import { getGalleryItems } from "../src/lib/db/queries/gallery";
import { getAllRecipes, getCookingStats } from "../src/lib/db/queries/recipes";
import { getDestinations, getTravelStats, getTripById } from "../src/lib/db/queries/travel";

async function main() {
  const recipes = await getAllRecipes();
  const cookingStats = await getCookingStats();
  const cookingGallery = await getGalleryItems("cooking");
  const climbingStats = await getClimbingStats();
  const climbingProjects = await getClimbingProjects();
  const climbingGear = await getClimbingGearItems();
  const climbingProgression = await getClimbingProgression();
  const climbingGallery = await getGalleryItems("climbing");
  const destinations = await getDestinations();
  const travelStats = await getTravelStats();
  const oman = await getTripById("oman");
  const travelGallery = await getGalleryItems("travel");

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
          gearCount: climbingGear.length,
          progressionCount: climbingProgression.length,
          galleryCount: climbingGallery.length,
        },
        travel: {
          stats: travelStats,
          destinationCount: destinations.length,
          destinationIds: destinations.map((d) => d.id),
          omanTrip: oman
            ? {
                country: oman.country,
                stops: oman.route.stops.length,
                moments: oman.moments.length,
                notes: oman.fieldNotes.length,
              }
            : null,
          galleryCount: travelGallery.length,
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
