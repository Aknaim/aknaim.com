import { formatLongDate, isIsoDate } from "@/lib/dates";

/** Format optional last-active date for shelf display. */
export function formatLastActive(lastActive: string | null | undefined): string | null {
  if (!lastActive?.trim()) return null;
  const value = lastActive.trim();
  if (/^last active:/i.test(value)) return value;
  if (isIsoDate(value)) return `Last active: ${formatLongDate(value)}`;
  return `Last active: ${value}`;
}
