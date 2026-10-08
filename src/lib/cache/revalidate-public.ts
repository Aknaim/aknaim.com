import { revalidatePath } from "next/cache";
import {
  CLIMBING_PUBLIC_PATHS,
  COURSE_PUBLIC_PATHS,
  listPublicPathsToRevalidate,
  listTravelPathsToRevalidate,
} from "@/lib/cache/public-paths";

function revalidatePaths(paths: readonly string[]): number {
  for (const path of paths) {
    revalidatePath(path);
  }
  return paths.length;
}

/** Bust ISR/R2 for every public surface (Refresh all + post-deploy). */
export async function revalidatePublicSite(): Promise<number> {
  return revalidatePaths(await listPublicPathsToRevalidate());
}

export function revalidateCoursePublicPages(): number {
  return revalidatePaths(COURSE_PUBLIC_PATHS);
}

export function revalidateClimbingPublicPages(): number {
  return revalidatePaths(CLIMBING_PUBLIC_PATHS);
}

export async function revalidateTravelPublicPages(): Promise<number> {
  return revalidatePaths(await listTravelPathsToRevalidate());
}
