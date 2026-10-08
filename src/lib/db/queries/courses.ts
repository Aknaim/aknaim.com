import { asc } from "drizzle-orm";
import { CARPENTRY_COURSES } from "@/lib/courses/carpentry";
import { COOKING_COURSES } from "@/lib/courses/cooking";
import { LANGUAGES_COURSES } from "@/lib/courses/languages";
import { PHOTOGRAPHY_COURSES } from "@/lib/courses/photography";
import type { Course, CourseDefinition, CourseInterest } from "@/lib/courses/types";
import { toIsoDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { courseCompletions } from "@/lib/db/schema";

const ALL_COURSES: CourseDefinition[] = [
  ...PHOTOGRAPHY_COURSES,
  ...COOKING_COURSES,
  ...CARPENTRY_COURSES,
  ...LANGUAGES_COURSES,
];

type CourseDates = {
  startedOn: string | null;
  completedOn: string | null;
};

export function getCourseCatalog(): CourseDefinition[] {
  return ALL_COURSES;
}

export function getCourseDefinition(id: string): CourseDefinition | undefined {
  return ALL_COURSES.find((course) => course.id === id);
}

async function datesMap(): Promise<Map<string, CourseDates>> {
  try {
    const rows = await db
      .select({
        id: courseCompletions.id,
        startedOn: courseCompletions.startedOn,
        completedOn: courseCompletions.completedOn,
      })
      .from(courseCompletions)
      .orderBy(asc(courseCompletions.id));
    return new Map(
      rows.map((row) => [
        row.id,
        {
          startedOn: toIsoDate(row.startedOn),
          completedOn: toIsoDate(row.completedOn),
        },
      ])
    );
  } catch {
    return new Map();
  }
}

function mergeCourse(
  definition: CourseDefinition,
  dates: CourseDates | undefined
): Course {
  return {
    ...definition,
    startedOn: dates?.startedOn ?? null,
    completedOn: dates?.completedOn ?? null,
  };
}

export async function getCoursesForInterest(interest: CourseInterest): Promise<Course[]> {
  const dates = await datesMap();
  return ALL_COURSES.filter((course) => course.interest === interest).map((course) =>
    mergeCourse(course, dates.get(course.id))
  );
}

export async function listCoursesForAdmin(): Promise<Course[]> {
  const dates = await datesMap();
  return ALL_COURSES.map((course) => mergeCourse(course, dates.get(course.id)));
}

export async function getCourseForAdmin(id: string): Promise<Course | null> {
  const definition = getCourseDefinition(id);
  if (!definition) return null;
  const dates = await datesMap();
  return mergeCourse(definition, dates.get(id));
}
