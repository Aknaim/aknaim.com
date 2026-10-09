const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const SEASONS: Record<string, number> = {
  spring: 3,
  summer: 6,
  fall: 9,
  autumn: 9,
  winter: 12,
};

/** True for `YYYY-MM-DD`. */
export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Normalize DB/driver date values to `YYYY-MM-DD`.
 * Handles ISO dates, ISO datetimes, and `Date` stringifications.
 */
export function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  if (isIsoDate(raw)) return raw;
  const isoPrefix = raw.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s]|$)/);
  if (isoPrefix) return isoPrefix[1];
  return null;
}

/** Format ISO date for cards/shelves, e.g. `Mar 2025`. */
export function formatMonthYear(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  if (!y || !m) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Format ISO date like climbing labels, e.g. `Oct 7, 2025`. */
export function formatLongDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Best-effort parse of admin/legacy labels into `YYYY-MM-DD` for `<input type="date">`.
 * Supports ISO, `May 2024`, `Fall 2024`, etc.
 */
export function toInputDate(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const raw = value.trim();
  if (isIsoDate(raw)) return raw;

  const monthYear = raw.match(/^([a-z]+)\s+(\d{4})$/i);
  if (monthYear) {
    const month = MONTHS[monthYear[1].toLowerCase()];
    if (month) {
      return `${monthYear[2]}-${String(month).padStart(2, "0")}-01`;
    }
  }

  const seasonYear = raw.match(/^(spring|summer|fall|autumn|winter)\s+(\d{4})$/i);
  if (seasonYear) {
    const month = SEASONS[seasonYear[1].toLowerCase()];
    if (month) {
      return `${seasonYear[2]}-${String(month).padStart(2, "0")}-01`;
    }
  }

  const yearOnly = raw.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  return "";
}

/** Sort key: higher = more recent. Prefers ISO; falls back to month/year labels. */
export function dateSortKey(value: string): number {
  if (isIsoDate(value)) {
    return Number(value.replaceAll("-", ""));
  }
  const input = toInputDate(value);
  if (input) return Number(input.replaceAll("-", ""));
  const year = value.match(/\d{4}/);
  return year ? Number(year[0]) * 10000 : 0;
}

function utcDay(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Inclusive day count between two ISO dates. */
export function inclusiveDaySpan(startIso: string, endIso: string): number {
  return Math.max(1, Math.round(utcDay(endIso) - utcDay(startIso)) + 1);
}

/** Human span for course cards, e.g. `6 weeks` or `3 days`. */
export function formatDurationLabel(startIso: string, endIso: string): string {
  const days = inclusiveDaySpan(startIso, endIso);
  if (days < 14) {
    return days === 1 ? "1 day" : `${days} days`;
  }
  const weeks = Math.max(1, Math.round(days / 7));
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

/** Public course date line from optional start/end ISO dates. */
export function formatCourseDateRange(
  startedOn: string | null | undefined,
  completedOn: string | null | undefined
): string | null {
  const start = toIsoDate(startedOn);
  const end = toIsoDate(completedOn);

  if (start && end) {
    const duration = formatDurationLabel(start, end);
    if (start === end) {
      return `${formatLongDate(start)} · ${duration}`;
    }
    return `${formatLongDate(start)} – ${formatLongDate(end)} · ${duration}`;
  }
  if (start) return `Started ${formatLongDate(start)}`;
  if (end) return `Completed ${formatLongDate(end)}`;
  return null;
}

/** Compact spine label for course chronology, e.g. `Jan–Apr 2023`. */
export function formatCourseSpineRange(
  startedOn: string | null | undefined,
  completedOn: string | null | undefined
): string | null {
  const start = toIsoDate(startedOn);
  const end = toIsoDate(completedOn);

  if (start && end) {
    if (start.slice(0, 7) === end.slice(0, 7)) {
      return formatMonthYear(start);
    }
    const [startYear, startMonth] = start.split("-").map(Number);
    const [endYear, endMonth] = end.split("-").map(Number);
    if (startYear && endYear && startYear === endYear && startMonth && endMonth) {
      const startLabel = new Date(Date.UTC(startYear, startMonth - 1, 1)).toLocaleDateString(
        "en-US",
        { month: "short", timeZone: "UTC" }
      );
      const endLabel = new Date(Date.UTC(endYear, endMonth - 1, 1)).toLocaleDateString(
        "en-US",
        { month: "short", timeZone: "UTC" }
      );
      return `${startLabel}–${endLabel} ${startYear}`;
    }
    return `${formatMonthYear(start)} – ${formatMonthYear(end)}`;
  }
  if (start) return formatMonthYear(start);
  if (end) return formatMonthYear(end);
  return null;
}

/** Sort key for chronology: startedOn, then completedOn; undated last. */
export function courseChronologyKey(course: {
  startedOn: string | null | undefined;
  completedOn: string | null | undefined;
}): string {
  return toIsoDate(course.startedOn) ?? toIsoDate(course.completedOn) ?? "9999-99-99";
}
