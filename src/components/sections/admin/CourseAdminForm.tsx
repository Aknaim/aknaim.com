"use client";

import { useActionState } from "react";
import { AdminDateField } from "@/components/sections/admin/AdminField";
import {
  saveCourseCompletion,
  type CourseSaveState,
} from "@/lib/actions/admin/courses";
import { formatCourseDateRange, toInputDate } from "@/lib/dates";
import type { Course } from "@/lib/courses/types";

export function CourseAdminForm({
  course,
  saved,
}: {
  course: Course;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState<CourseSaveState, FormData>(
    saveCourseCompletion,
    null
  );

  const preview = formatCourseDateRange(course.startedOn, course.completedOn);

  return (
    <form action={action} className="space-y-6 max-w-xl">
      <input type="hidden" name="id" value={course.id} />

      {saved ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Saved
        </p>
      ) : null}
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}

      <div className="space-y-1 text-sm text-foreground-muted">
        <p className="text-white">{course.title}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest">
          {[course.code, course.school].filter(Boolean).join(" · ")}
        </p>
        {preview ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent/80 pt-1">
            {preview}
          </p>
        ) : null}
      </div>

      <AdminDateField
        label="Started on"
        name="startedOn"
        defaultValue={toInputDate(course.startedOn)}
        hint="First class / term start."
      />

      <AdminDateField
        label="Completed on"
        name="completedOn"
        defaultValue={toInputDate(course.completedOn)}
        hint="Last class / term end. Together these drive the public range and week count."
      />

      <button
        type="submit"
        disabled={pending}
        className="border border-accent/50 bg-accent/10 px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-accent/20 transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
