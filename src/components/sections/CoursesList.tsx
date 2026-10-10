"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useImageLightbox } from "@/hooks/useImageLightbox";
import {
  courseChronologyKey,
  formatCourseSpineRange,
} from "@/lib/dates";
import type { Course, CourseOutcomePhoto } from "@/lib/courses/types";
import type { LightboxImage } from "@/lib/types/lightbox";

function toLightboxImages(photos: CourseOutcomePhoto[]): LightboxImage[] {
  return photos.map((photo, index) => ({
    id: `course-photo-${index}-${photo.src}`,
    src: photo.src,
    alt: photo.alt,
    title: photo.assignment,
    subtitle: photo.alt,
  }));
}

function OutcomeThumbs({
  photos,
  onOpen,
}: {
  photos: CourseOutcomePhoto[];
  onOpen: (photo: CourseOutcomePhoto) => void;
}) {
  if (photos.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2 pt-2">
      {photos.map((photo) => (
        <li key={`${photo.src}-${photo.alt}`}>
          <button
            type="button"
            onClick={() => onOpen(photo)}
            className="relative block h-20 w-28 overflow-hidden border border-[#1c1c1c] bg-[#111] hover:border-[#333] transition-colors cursor-zoom-in group"
            aria-label={`View full size: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="112px"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

function TimelineNode({
  index,
  isLast,
  children,
}: {
  index: number;
  isLast: boolean;
  children: ReactNode;
}) {
  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      <div className="flex flex-col items-center shrink-0 w-6">
        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-[#0c0c0c] font-mono text-[9px] text-accent">
          {index + 1}
        </span>
        {!isLast ? (
          <span
            className="mt-1 w-px flex-1 min-h-[1.25rem] bg-[#1f1f1f]"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </li>
  );
}

function sortCoursesChronologically(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const keyA = courseChronologyKey(a);
    const keyB = courseChronologyKey(b);
    if (keyA !== keyB) return keyA.localeCompare(keyB);
    return a.title.localeCompare(b.title);
  });
}

export function CoursesList({
  courses,
  heading = "Courses",
  id = "courses",
}: {
  courses: Course[];
  heading?: string;
  id?: string;
}) {
  const sortedCourses = sortCoursesChronologically(courses);
  let latestDatedId: string | null =
    sortedCourses[sortedCourses.length - 1]?.id ?? null;
  for (let i = sortedCourses.length - 1; i >= 0; i -= 1) {
    const course = sortedCourses[i];
    if (course.startedOn || course.completedOn) {
      latestDatedId = course.id;
      break;
    }
  }

  const [expandedId, setExpandedId] = useState<string | null>(latestDatedId);
  const [lightboxCourseId, setLightboxCourseId] = useState<string | null>(null);
  const courseItemRefs = useRef(new Map<string, HTMLLIElement>());
  const { activeIndex, isOpen, open, close, setActiveIndex } = useImageLightbox();

  function toggleCourse(courseId: string) {
    setExpandedId((current) => {
      const next = current === courseId ? null : courseId;
      if (next) {
        // After expand layout, pin the course title near the top of the viewport.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            courseItemRefs.current
              .get(courseId)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
      return next;
    });
  }

  const lightboxImages = lightboxCourseId
    ? toLightboxImages(
        sortedCourses.find((course) => course.id === lightboxCourseId)
          ?.outcomes ?? []
      )
    : [];

  if (sortedCourses.length === 0) return null;

  function openPhoto(courseId: string, photo: CourseOutcomePhoto) {
    const photos =
      sortedCourses.find((c) => c.id === courseId)?.outcomes ?? [];
    const index = photos.findIndex(
      (item) => item.src === photo.src && item.alt === photo.alt
    );
    if (index < 0) return;
    setLightboxCourseId(courseId);
    open(index);
  }

  return (
    <section id={id} className="space-y-6 scroll-mt-8">
      <div className="border-b border-[#141414] pb-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          {heading}
        </h2>
      </div>
      <ol className="relative">
        {sortedCourses.map((course, courseIndex) => {
          const isOpenCourse = expandedId === course.id;
          const isLatest = course.id === latestDatedId;
          const isLastCourse = courseIndex === sortedCourses.length - 1;
          const hasSessions = course.sessions.some((s) => s.items.length > 0);
          const spineDate = formatCourseSpineRange(
            course.startedOn,
            course.completedOn
          );
          const outcomes = course.outcomes ?? [];
          const unassigned = outcomes.filter((photo) => !photo.assignment);
          const canExpand = hasSessions || outcomes.length > 0;
          const populatedSessions = course.sessions.filter(
            (session) => session.items.length > 0
          );
          /** Multi-week courses: one timeline step per week; dishes nest underneath. */
          const timelineBySession = populatedSessions.length > 1;

          const dateClassName = `font-mono text-[11px] uppercase tracking-widest ${
            spineDate
              ? isLatest
                ? "text-accent/90"
                : "text-foreground-muted"
              : "text-foreground-subtle"
          }`;

          return (
            <li
              key={course.id}
              ref={(node) => {
                if (node) courseItemRefs.current.set(course.id, node);
                else courseItemRefs.current.delete(course.id);
              }}
              className="relative pb-8 last:pb-0 scroll-mt-8"
            >
              {/* Mobile: date above the node */}
              <p className={`mb-2 sm:hidden ${dateClassName}`}>
                {spineDate ?? "Undated"}
              </p>

              <div className="flex gap-3 sm:gap-4">
                {/* Desktop: date column left of the rail */}
                <div className="hidden sm:block sm:w-28 sm:shrink-0 sm:pt-0.5 sm:text-right">
                  <p className={dateClassName}>{spineDate ?? "Undated"}</p>
                </div>

                <div className="flex flex-col items-center shrink-0 w-3 pt-1.5">
                  <span
                    className={`relative z-10 h-2.5 w-2.5 rounded-full border ${
                      isLatest
                        ? "border-accent bg-accent"
                        : "border-[#3a3a3a] bg-[#0c0c0c]"
                    }`}
                    aria-hidden
                  />
                  {!isLastCourse ? (
                    <span
                      className="mt-1 w-px flex-1 min-h-[2rem] bg-[#141414]"
                      aria-hidden
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 border border-[#141414] bg-[#0c0c0c]">
                  <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-sm text-white font-medium">
                          {course.title}
                        </h3>
                        {course.code ? (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-accent/80">
                            {course.code}
                          </span>
                        ) : null}
                      </div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
                        {course.school}
                      </p>
                      {course.blurb ? (
                        <p className="text-xs text-foreground-muted leading-relaxed max-w-xl">
                          {course.blurb}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        {course.hours != null ? (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
                            {course.hours} hours
                          </span>
                        ) : null}
                        {outcomes.length > 0 ? (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-accent/70">
                            {outcomes.length} photo
                            {outcomes.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                        {course.href ? (
                          <a
                            href={course.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
                          >
                            Course page ↗
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {canExpand ? (
                      <button
                        type="button"
                        onClick={() => toggleCourse(course.id)}
                        aria-expanded={isOpenCourse}
                        className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-foreground-muted hover:text-white transition-colors self-start"
                      >
                        {isOpenCourse ? "Collapse" : "Expand"}
                      </button>
                    ) : null}
                  </div>

                  {isOpenCourse && canExpand ? (
                    <div className="border-t border-[#141414] px-4 py-5">
                      {timelineBySession ? (
                        <ol className="relative">
                          {populatedSessions.map((session, index) => {
                            const sessionPhotos = outcomes.filter(
                              (photo) =>
                                photo.assignment != null &&
                                session.items.includes(photo.assignment)
                            );
                            const isLast =
                              index === populatedSessions.length - 1;

                            return (
                              <TimelineNode
                                key={`${course.id}-${session.label}`}
                                index={index}
                                isLast={isLast}
                              >
                                <p className="text-sm text-white font-medium leading-snug">
                                  {session.label}
                                </p>
                                {session.items.length === 1 &&
                                session.items[0] !== session.label ? (
                                  <p className="text-xs text-foreground-muted leading-snug mt-1">
                                    {session.items[0]}
                                  </p>
                                ) : null}
                                {session.items.length > 1 ? (
                                  <ul className="mt-2 space-y-1">
                                    {session.items.map((item) => (
                                      <li
                                        key={`${session.label}-${item}`}
                                        className="text-xs text-foreground-muted leading-snug pl-3 relative before:absolute before:left-0 before:top-[0.45em] before:h-1 before:w-1 before:rounded-full before:bg-[#3a3a3a]"
                                      >
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                                <OutcomeThumbs
                                  photos={sessionPhotos}
                                  onOpen={(photo) =>
                                    openPhoto(course.id, photo)
                                  }
                                />
                              </TimelineNode>
                            );
                          })}
                        </ol>
                      ) : (
                        <ol className="relative">
                          {(populatedSessions[0]?.items ?? []).map(
                            (item, index, items) => {
                              const itemPhotos = outcomes.filter(
                                (photo) => photo.assignment === item
                              );
                              const isLast = index === items.length - 1;

                              return (
                                <TimelineNode
                                  key={`${course.id}-${item}`}
                                  index={index}
                                  isLast={isLast}
                                >
                                  <p className="text-sm text-white font-medium leading-snug">
                                    {item}
                                  </p>
                                  <OutcomeThumbs
                                    photos={itemPhotos}
                                    onOpen={(photo) =>
                                      openPhoto(course.id, photo)
                                    }
                                  />
                                </TimelineNode>
                              );
                            }
                          )}
                        </ol>
                      )}

                      {unassigned.length > 0 ? (
                        <div className="space-y-2 pt-5 mt-2 border-t border-[#141414]">
                          <p className="font-mono text-[9px] uppercase tracking-widest text-accent/70">
                            Course photos
                          </p>
                          <OutcomeThumbs
                            photos={unassigned}
                            onOpen={(photo) => openPhoto(course.id, photo)}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <ImageLightbox
        images={lightboxImages}
        activeIndex={isOpen ? activeIndex : null}
        onClose={() => {
          close();
          setLightboxCourseId(null);
        }}
        onIndexChange={setActiveIndex}
      />
    </section>
  );
}
