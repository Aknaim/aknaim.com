import type { Metadata } from "next";
import Link from "next/link";
import { getMediaDriver, isR2Configured } from "@/lib/media/driver";
import { listMediaAssets } from "@/lib/db/queries/media";
import { MediaUploadForm } from "@/components/sections/admin/MediaUploadForm";

export const metadata: Metadata = {
  title: "Admin Media",
};

export default async function AdminMediaPage() {
  const assets = await listMediaAssets(200);
  const driver = getMediaDriver();
  const r2Ready = isR2Configured();

  return (
    <main className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-white">Media</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Shared upload library. Local dev writes to{" "}
            <code className="text-foreground-subtle">public/media</code>; production uses R2.
          </p>
        </div>
        <Link
          href="/admin/gallery"
          className="border border-[#262626] px-4 py-2 text-xs uppercase tracking-widest text-foreground-muted hover:text-white hover:border-accent transition-colors"
        >
          Gallery →
        </Link>
      </div>

      <div className="border border-[#141414] bg-[#0c0c0c] px-4 py-3 text-sm text-foreground-muted">
        Active driver:{" "}
        <span className="text-white">{driver}</span>
        {driver === "local"
          ? " — files land under LOCAL_MEDIA_ROOT (or public/media). Prod R2 is not used."
          : r2Ready
            ? " — uploading to Cloudflare R2."
            : " — R2 selected but credentials are missing."}
      </div>

      <MediaUploadForm disabled={driver === "r2" && !r2Ready} />

      <ul className="divide-y divide-[#141414] border border-[#141414]">
        {assets.length === 0 ? (
          <li className="px-4 py-6 text-sm text-foreground-muted">No media assets yet.</li>
        ) : (
          assets.map((asset) => (
            <li key={asset.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{asset.alt || asset.url}</div>
                <div className="font-mono text-[10px] text-foreground-muted mt-1 break-all">
                  {asset.mediaType} · {asset.id}
                </div>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-accent/80 hover:text-accent break-all"
                >
                  {asset.url}
                </a>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
