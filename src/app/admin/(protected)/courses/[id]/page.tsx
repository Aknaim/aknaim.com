import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseAdminForm } from "@/components/sections/admin/CourseAdminForm";
import { getCourseForAdmin } from "@/lib/db/queries/courses";

export const metadata: Metadata = {
  title: "Edit Course",
};

export default async function AdminCourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const course = await getCourseForAdmin(id);
  if (!course) notFound();

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/courses"
          className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-white"
        >
          ← Courses
        </Link>
        <h1 className="font-display text-3xl font-light text-white mt-4">
          Edit {course.title}
        </h1>
      </div>
      <CourseAdminForm course={course} saved={saved === "1"} />
    </main>
  );
}
