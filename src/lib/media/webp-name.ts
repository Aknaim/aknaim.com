/** Rewrite an image filename to `.webp`. Leaves videos/other names unchanged. */
export function toWebpFileName(preferredFileName: string | undefined): string | undefined {
  if (!preferredFileName?.trim()) return preferredFileName;
  const cleaned = preferredFileName.trim();
  if (/\.webp$/i.test(cleaned)) return cleaned;
  if (/\.(jpe?g|png|gif|avif|tiff?)$/i.test(cleaned)) {
    return cleaned.replace(/\.(jpe?g|png|gif|avif|tiff?)$/i, ".webp");
  }
  // e.g. send.mp4 — do not append .webp
  return cleaned;
}

export function shouldConvertImageToWebp(contentType: string): boolean {
  const type = contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  return (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/gif" ||
    type === "image/avif" ||
    type === "image/tiff"
  );
}
