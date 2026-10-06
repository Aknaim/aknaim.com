import { shouldConvertImageToWebp, toWebpFileName } from "@/lib/media/webp-name";

/**
 * Browser-side WebP encode for admin uploads.
 * Cloudflare Workers cannot run native `sharp`, so conversion happens here
 * before the file is sent to the server action / R2.
 */
export async function convertImageFileToWebp(
  file: File,
  quality = 0.82
): Promise<File> {
  if (!shouldConvertImageToWebp(file.type)) {
    return file;
  }

  if (file.type === "image/webp") {
    const name = toWebpFileName(file.name) ?? file.name;
    if (name === file.name) return file;
    return new File([file], name, { type: "image/webp", lastModified: file.lastModified });
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create canvas for WebP conversion");
    }
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Browser could not encode WebP"));
            return;
          }
          resolve(result);
        },
        "image/webp",
        quality
      );
    });

    const name = toWebpFileName(file.name) ?? "image.webp";
    return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
