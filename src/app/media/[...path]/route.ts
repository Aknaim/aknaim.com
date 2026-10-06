import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLocalMediaRoot } from "@/lib/media/local-root";

export const runtime = "nodejs";

/**
 * Dev/local media serving when files live outside `public/` via LOCAL_MEDIA_ROOT.
 * Production should use R2 public URLs in media_assets — this returns 404 there.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const useDisk =
    process.env.MEDIA_DRIVER === "local" ||
    process.env.NODE_ENV !== "production";

  if (!useDisk) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { path: parts } = await context.params;
  if (!parts?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const root = path.resolve(/* turbopackIgnore: true */ getLocalMediaRoot());
  const absolute = path.resolve(/* turbopackIgnore: true */ root, ...parts);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(absolute);
    if (!info.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Videos can be large; readFile is fine for gym send clips on local disk.
    // Streaming Body types vary across Next/OpenNext — buffer keeps this simple.
    const body = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const type =
      ext === ".webp"
        ? "image/webp"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".png"
            ? "image/png"
            : ext === ".mp4"
              ? "video/mp4"
              : ext === ".webm"
                ? "video/webm"
                : "application/octet-stream";

    return new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
