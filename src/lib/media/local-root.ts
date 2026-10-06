import path from "node:path";

/**
 * Local media directory for uploads / sync.
 * Prefer `LOCAL_MEDIA_ROOT` (e.g. Pictures\\aknaim.com\\media) so `public/media`
 * can stay a normal empty folder and Turbopack/OpenNext builds do not choke on
 * a Windows junction pointing outside the repo.
 */
export function getLocalMediaRoot(): string {
  const fromEnv = process.env.LOCAL_MEDIA_ROOT?.trim();
  if (fromEnv) {
    return path.resolve(/* turbopackIgnore: true */ fromEnv);
  }
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "media"
  );
}
