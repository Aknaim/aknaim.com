"use client";

import { useState } from "react";
import { uploadAdminMediaFile } from "@/lib/media/upload-client";

export type UploadedMediaRef = {
  url: string;
  mediaId: string;
  name: string;
};

interface MultiMediaUploadFieldProps {
  /** Hidden input name: JSON array of { url, mediaId, name } */
  name: string;
  label: string;
  folder: string;
  accept?: string;
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
  onPendingChange,
}: MultiMediaUploadFieldProps) {
  const [items, setItems] = useState<UploadedMediaRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

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
        uploaded.push({ url: result.url, mediaId: result.id, name: file.name });
      }
      if (uploaded.length > 0) {
        setItems((prev) => [...prev, ...uploaded]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(0);
      setStatus(null);
      onPendingChange?.(false);
    }
  }

  function removeAt(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted block">
        {label}
      </span>
      <p className="font-mono text-[9px] text-foreground-subtle">
        Saves under <span className="text-foreground-muted">/{folder}/</span> and attaches to this
        trip’s gallery on save.
      </p>

      <input type="hidden" name={name} value={JSON.stringify(items)} />

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
          {status ?? `Uploading ${pending} file(s)…`}
        </p>
      ) : null}
      {error ? <p className="font-mono text-[10px] text-red-400">{error}</p> : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-[#141414] border border-[#141414]">
          {items.map((item, index) => (
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
      ) : (
        <p className="font-mono text-[10px] text-foreground-subtle">No new uploads yet.</p>
      )}
    </div>
  );
}
