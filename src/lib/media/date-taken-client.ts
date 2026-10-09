/**
 * Browser helpers for gallery "date taken".
 * Must run on the original File *before* canvas→WebP (that strips EXIF).
 */

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDateUtc(d: Date): string | null {
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** Camera dumps like `20240301_174309.jpg` or `IMG_20240301_174309.jpg`. */
export function dateTakenFromFilename(name: string): string | null {
  const match = name.match(/(?:^|[^\d])(\d{4})(\d{2})(\d{2})(?:[_\D]|$)/);
  if (!match) return null;
  const [, y, m, d] = match;
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${y}-${m}-${d}`;
}

/**
 * Parse JPEG EXIF DateTimeOriginal / DateTimeDigitized / DateTime → YYYY-MM-DD.
 * Returns null for non-JPEG or missing tags (no new dependency).
 */
export async function dateTakenFromJpegExif(file: File): Promise<string | null> {
  const type = file.type || "";
  const looksJpeg =
    type === "image/jpeg" ||
    type === "image/jpg" ||
    /\.jpe?g$/i.test(file.name);
  if (!looksJpeg) return null;

  // EXIF lives near the start; 256 KiB covers typical camera headers.
  const buf = await file.slice(0, 256 * 1024).arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (size < 2 || offset + 2 + size > bytes.length) break;

    // APP1 may contain Exif
    if (marker === 0xe1) {
      const start = offset + 4;
      const end = offset + 2 + size;
      const parsed = parseExifApp1(bytes.subarray(start, end));
      if (parsed) return parsed;
    }

    // SOS — image data; stop scanning
    if (marker === 0xda) break;
    offset += 2 + size;
  }

  return null;
}

function parseExifApp1(segment: Uint8Array): string | null {
  // "Exif\0\0"
  if (segment.length < 14) return null;
  if (
    segment[0] !== 0x45 ||
    segment[1] !== 0x78 ||
    segment[2] !== 0x69 ||
    segment[3] !== 0x66 ||
    segment[4] !== 0x00 ||
    segment[5] !== 0x00
  ) {
    return null;
  }

  const tiff = segment.subarray(6);
  const little = tiff[0] === 0x49 && tiff[1] === 0x49;
  const read16 = (i: number) =>
    little ? tiff[i] | (tiff[i + 1] << 8) : (tiff[i] << 8) | tiff[i + 1];
  const read32 = (i: number) =>
    little
      ? tiff[i] | (tiff[i + 1] << 8) | (tiff[i + 2] << 16) | (tiff[i + 3] << 24)
      : (tiff[i] << 24) | (tiff[i + 1] << 16) | (tiff[i + 2] << 8) | tiff[i + 3];

  if (read16(2) !== 42) return null;
  const ifd0 = read32(4);
  if (ifd0 <= 0 || ifd0 + 2 > tiff.length) return null;

  // Prefer DateTimeOriginal (0x9003) / Digitized (0x9004) in Exif IFD; fall back to DateTime (0x0132) in IFD0.
  const exifOffset = findTagOffset(tiff, ifd0, 0x8769, little, read16, read32);
  const candidates: string[] = [];
  if (exifOffset != null && exifOffset + 2 < tiff.length) {
    const original = readAsciiTag(tiff, exifOffset, 0x9003, little, read16, read32);
    const digitized = readAsciiTag(tiff, exifOffset, 0x9004, little, read16, read32);
    if (original) candidates.push(original);
    if (digitized) candidates.push(digitized);
  }
  const fallback = readAsciiTag(tiff, ifd0, 0x0132, little, read16, read32);
  if (fallback) candidates.push(fallback);

  for (const raw of candidates) {
    const iso = exifDateTimeToIso(raw);
    if (iso) return iso;
  }
  return null;
}

function findTagOffset(
  tiff: Uint8Array,
  ifdOffset: number,
  tagId: number,
  _little: boolean,
  read16: (i: number) => number,
  read32: (i: number) => number
): number | null {
  const count = read16(ifdOffset);
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * 12;
    if (entry + 12 > tiff.length) break;
    if (read16(entry) !== tagId) continue;
    // LONG pointing to Exif IFD
    return read32(entry + 8);
  }
  return null;
}

function readAsciiTag(
  tiff: Uint8Array,
  ifdOffset: number,
  tagId: number,
  _little: boolean,
  read16: (i: number) => number,
  read32: (i: number) => number
): string | null {
  const count = read16(ifdOffset);
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * 12;
    if (entry + 12 > tiff.length) break;
    if (read16(entry) !== tagId) continue;
    const type = read16(entry + 2);
    const num = read32(entry + 4);
    // ASCII
    if (type !== 2 || num < 1) return null;
    let valueOffset = entry + 8;
    if (num > 4) valueOffset = read32(entry + 8);
    if (valueOffset < 0 || valueOffset + num > tiff.length) return null;
    let text = "";
    for (let j = 0; j < num; j++) {
      const c = tiff[valueOffset + j];
      if (c === 0) break;
      text += String.fromCharCode(c);
    }
    return text.trim();
  }
  return null;
}

/** EXIF string `YYYY:MM:DD HH:MM:SS` → `YYYY-MM-DD`. */
function exifDateTimeToIso(raw: string): string | null {
  const match = raw.match(/^(\d{4}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${y}-${m}-${d}`;
}

/**
 * Best-effort date for a gallery upload, in priority order:
 * EXIF → filename → file lastModified → today.
 */
export async function resolveGalleryDateTaken(file: File): Promise<string> {
  const fromExif = await dateTakenFromJpegExif(file);
  if (fromExif) return fromExif;

  const fromName = dateTakenFromFilename(file.name);
  if (fromName) return fromName;

  const fromModified = toIsoDateUtc(new Date(file.lastModified));
  if (fromModified) return fromModified;

  return toIsoDateUtc(new Date()) ?? "1970-01-01";
}
