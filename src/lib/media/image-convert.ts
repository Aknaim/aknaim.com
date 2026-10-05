import sharp from "sharp";

const CONVERTIBLE = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
]);

export function shouldConvertImageToWebp(contentType: string): boolean {
  const type = contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  return CONVERTIBLE.has(type);
}

/** Rewrite a preferred filename to `.webp` when converting. */
export function toWebpFileName(preferredFileName: string | undefined): string | undefined {
  if (!preferredFileName?.trim()) return preferredFileName;
  const cleaned = preferredFileName.trim();
  if (/\.webp$/i.test(cleaned)) return cleaned;
  if (/\.(jpe?g|png|gif|avif|tiff?)$/i.test(cleaned)) {
    return cleaned.replace(/\.(jpe?g|png|gif|avif|tiff?)$/i, ".webp");
  }
  return `${cleaned}.webp`;
}

export async function convertImageToWebp(
  body: Buffer | Uint8Array,
  quality = 82
): Promise<Buffer> {
  return sharp(Buffer.from(body)).rotate().webp({ quality }).toBuffer();
}
