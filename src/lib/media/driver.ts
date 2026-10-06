export type MediaDriver = "local" | "r2";

/**
 * Local next dev → filesystem under public/media (default).
 * Production → R2 (requires R2_* secrets).
 * Override with MEDIA_DRIVER=local|r2.
 */
export function getMediaDriver(): MediaDriver {
  const forced = process.env.MEDIA_DRIVER?.trim().toLowerCase();
  if (forced === "local") return "local";
  if (forced === "r2") return "r2";
  return process.env.NODE_ENV === "production" ? "r2" : "local";
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL
  );
}
