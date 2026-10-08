import type { Metadata } from "next";
import Link from "next/link";
import { refreshCoursePublicPages } from "@/lib/actions/admin/courses";
import { formatCourseDateRange } from "@/lib/dates";
import { listCoursesForAdmin } from "@/lib/db/queries/courses";

export const metadata: Metadata = {
  title: "Admin Courses",
};

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ refreshed?: string }>;
}) {
  const { refreshed } = await searchParams;
  const courses = await listCoursesForAdmin();

  return (
    <main className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Courses</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Set start and end dates for photography, cooking, and carpentry courses.
            Titles and syllabi stay in code.
          </p>
          {refreshed ? (
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mt-2">
              Public course pages cache cleared
            </p>
          ) : null}
        </div>
        <form action={refreshCoursePublicPages}>
          <button
            type="submit"
            className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-foreground-muted hover:border-accent hover:text-white transition-colors"
          >
            Refresh public pages
          </button>
        </form>
      </div>

      <ul className="divide-y divide-[#141414] border border-[#141414]">
        {courses.map((course) => (
          <li
            key={course.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <Link
                href={`/admin/courses/${course.id}`}
                className="text-sm text-white hover:text-accent transition-colors"
              >
                {course.title}
              </Link>
              <div className="font-mono text-[10px] text-foreground-muted mt-1">
                {course.interest}
                {course.code ? ` · ${course.code}` : ""}
                {" · "}
                {formatCourseDateRange(course.startedOn, course.completedOn) ??
                  "No dates yet"}
                {course.hours != null ? ` · ${course.hours} hours` : ""}
              </div>
            </div>
            <Link
              href={`/admin/courses/${course.id}`}
              className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
            >
              Edit →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
