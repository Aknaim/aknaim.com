/**
 * Skip Next/OpenNext image optimization for sources that already live on
 * our media CDN or local media root. Cloudflare Images (IMAGES binding)
 * fetches and transforms those URLs inside the Worker and regularly hits
 * Error 1102 (CPU/memory) on large WebP gallery dumps.
 */
export function shouldSkipImageOptimizer(src: string): boolean {
  if (!src) return true;
  return (
    src.startsWith("/media/") ||
    src.startsWith("https://") ||
    src.startsWith("http://")
  );
}
