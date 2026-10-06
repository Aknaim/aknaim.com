import sharp from "sharp";
import { shouldConvertImageToWebp, toWebpFileName } from "@/lib/media/webp-name";

export { shouldConvertImageToWebp, toWebpFileName };

/** Node/local only — native sharp is unavailable on Cloudflare Workers. */
export async function convertImageToWebp(
  body: Buffer | Uint8Array,
  quality = 82
): Promise<Buffer> {
  return sharp(Buffer.from(body)).rotate().webp({ quality }).toBuffer();
}
