"use client";

import { useState } from "react";
import { attachTravelGalleryBatch } from "@/lib/actions/admin/travel";
import { resolveGalleryDateTaken } from "@/lib/media/date-taken-client";
import { uploadAdminMediaFile } from "@/lib/media/upload-client";

export type UploadedMediaRef = {
  url: string;
  mediaId: string;
  name: string;
  dateTaken: string;
};

interface MultiMediaUploadFieldProps {
  /** Hidden input name: JSON array of { url, mediaId, name } */
  name: string;
  label: string;
  folder: string;
  accept?: string;
  /**
   * When set (editing an existing trip), each upload is attached to the gallery
   * immediately in small batches — avoids Worker/Neon timeouts on Save place.
   */
  tripId?: string;
  /** Called after each successful file so parent can track pending count */
  onPendingChange?: (pending: boolean) => void;
}

function slugifyFileStem(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function MultiMediaUploadField({
  name,
  label,
  folder,
  accept = "image/*",
  tripId,
  onPendingChange,
}: MultiMediaUploadFieldProps) {
  const [pendingItems, setPendingItems] = useState<UploadedMediaRef[]>([]);
  const [attachedCount, setAttachedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  async function attachBatch(uploads: UploadedMediaRef[]) {
    if (!tripId || uploads.length === 0) return uploads;

    const stillPending: UploadedMediaRef[] = [];
    for (let i = 0; i < uploads.length; i += 5) {
      const chunk = uploads.slice(i, i + 5);
      setStatus(`Attaching ${i + 1}–${Math.min(i + chunk.length, uploads.length)} of ${uploads.length}…`);
      const result = await attachTravelGalleryBatch({
        tripId,
        uploads: chunk,
      });
      if (!result.ok) {
        stillPending.push(...chunk, ...uploads.slice(i + chunk.length));
        setError(result.error);
        break;
      }
      setAttachedCount((count) => count + result.attached + result.skipped);
    }
    return stillPending;
  }

  async function onFileChange(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    setError(null);
    setPending(files.length);
    onPendingChange?.(true);

    const uploaded: UploadedMediaRef[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stableName = `${slugifyFileStem(file.name) || "photo"}.webp`;
        setStatus(`Uploading ${i + 1}/${files.length}: ${file.name}`);
        // EXIF before WebP — canvas convert strips DateTimeOriginal.
        const dateTaken = await resolveGalleryDateTaken(file);
        const result = await uploadAdminMediaFile({
          file,
          folder,
          alt: file.name,
          // Canonical key at upload time — save skip R2 relocate + extra DB lookups.
          fileName: stableName,
          onProgress: (progress) =>
            setStatus(`${i + 1}/${files.length}: ${progress.label}`),
        });
        if (!result.ok) {
          setError(`${file.name}: ${result.error}`);
          break;
        }
        uploaded.push({
          url: result.url,
          mediaId: result.id,
          name: file.name,
          dateTaken,
        });
      }

      if (uploaded.length === 0) return;

      if (tripId) {
        const leftover = await attachBatch(uploaded);
        if (leftover.length > 0) {
          setPendingItems((prev) => [...prev, ...leftover]);
        }
      } else {
        setPendingItems((prev) => [...prev, ...uploaded]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(0);
      setStatus(null);
      onPendingChange?.(false);
    }
  }

  async function retryPendingAttach() {
    if (!tripId || pendingItems.length === 0) return;
    setError(null);
    setPending(pendingItems.length);
    onPendingChange?.(true);
    try {
      const leftover = await attachBatch(pendingItems);
      setPendingItems(leftover);
    } finally {
      setPending(0);
      setStatus(null);
      onPendingChange?.(false);
    }
  }

  function removeAt(index: number) {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted block">
        {label}
      </span>
      <p className="font-mono text-[9px] text-foreground-subtle">
        Saves under <span className="text-foreground-muted">/{folder}/</span>
        {tripId
          ? ". Attaches to the trip gallery as each batch finishes (don’t wait for Save)."
          : " and attaches to this trip’s gallery on save."}
      </p>

      <input type="hidden" name={name} value={JSON.stringify(pendingItems)} />

      <input
        type="file"
        accept={accept}
        multiple
        disabled={pending > 0}
        onChange={(e) => {
          void onFileChange(e.target.files);
          e.target.value = "";
        }}
        className="block w-full text-xs text-foreground-muted file:mr-3 file:border file:border-[#262626] file:bg-[#141414] file:px-3 file:py-1.5 file:text-[10px] file:uppercase file:tracking-widest file:text-white hover:file:border-accent disabled:opacity-40"
      />

      {pending > 0 ? (
        <p className="font-mono text-[10px] text-amber-400/90">
          {status ?? `Working ${pending} file(s)…`}
        </p>
      ) : null}
      {attachedCount > 0 ? (
        <p className="font-mono text-[10px] text-accent/80">
          {attachedCount} photo{attachedCount === 1 ? "" : "s"} in gallery
        </p>
      ) : null}
      {error ? <p className="font-mono text-[10px] text-red-400 whitespace-pre-wrap">{error}</p> : null}

      {pendingItems.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-[10px] text-amber-400/90">
              {pendingItems.length} not attached yet
            </p>
            {tripId ? (
              <button
                type="button"
                onClick={() => void retryPendingAttach()}
                disabled={pending > 0}
                className="font-mono text-[9px] uppercase tracking-widest text-accent hover:text-white disabled:opacity-40"
              >
                Retry attach
              </button>
            ) : null}
          </div>
          <ul className="divide-y divide-[#141414] border border-[#141414]">
            {pendingItems.map((item, index) => (
              <li
                key={`${item.mediaId}-${index}`}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="font-mono text-[10px] text-accent/80 truncate" title={item.url}>
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="font-mono text-[9px] uppercase tracking-widest text-red-400 hover:text-red-300 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="font-mono text-[10px] text-foreground-subtle">
          {attachedCount > 0 ? "All new uploads attached." : "No new uploads yet."}
        </p>
      )}
    </div>
  );
}
