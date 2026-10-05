"use client";

import { useEffect, useState, useTransition } from "react";
import { uploadMediaAsset } from "@/lib/actions/admin/media";

interface MediaUploadFieldProps {
  /** Hidden input name that receives the public URL after upload */
  name: string;
  label: string;
  folder?: string;
  /** Fixed stored filename, e.g. still.jpg */
  fileName?: string;
  accept?: string;
  defaultUrl?: string;
  required?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  /** Also write media asset UUID into this hidden field when set */
  idFieldName?: string;
  defaultMediaId?: string;
  /** Called with the chosen File before upload starts */
  onFileSelected?: (file: File) => void;
  /** Notify parent when URL / media id change (upload, paste, or external sync) */
  onAssetChange?: (next: { url: string; mediaId: string }) => void;
  /** Push an externally uploaded URL into this field (e.g. auto poster from video) */
  externalUrl?: string;
  externalMediaId?: string;
}

export function MediaUploadField({
  name,
  label,
  folder = "uploads",
  fileName,
  accept = "image/*,video/mp4,video/webm",
  defaultUrl = "",
  required,
  disabled,
  disabledReason,
  idFieldName,
  defaultMediaId = "",
  onFileSelected,
  onAssetChange,
  externalUrl,
  externalMediaId,
}: MediaUploadFieldProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [mediaId, setMediaId] = useState(defaultMediaId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (externalUrl === undefined) return;
    if (externalUrl === url && (externalMediaId ?? "") === mediaId) return;
    setUrl(externalUrl);
    setMediaId(externalMediaId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when parent pushes a new asset
  }, [externalUrl, externalMediaId]);

  function commit(nextUrl: string, nextMediaId: string) {
    setUrl(nextUrl);
    setMediaId(nextMediaId);
    onAssetChange?.({ url: nextUrl, mediaId: nextMediaId });
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || disabled) return;

    onFileSelected?.(file);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    formData.set("alt", label);
    if (fileName) formData.set("fileName", fileName);

    setError(null);
    startTransition(async () => {
      const result = await uploadMediaAsset(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      commit(result.url, result.id);
    });
  }

  return (
    <div className="space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted block">
        {label}
        {required ? <span className="text-accent/70"> *</span> : null}
      </span>

      <input type="hidden" name={name} value={url} />
      {idFieldName ? <input type="hidden" name={idFieldName} value={mediaId} /> : null}

      {disabled ? (
        <div className="border border-dashed border-[#262626] bg-[#0c0c0c] px-3 py-4 text-center">
          <p className="font-mono text-[10px] text-foreground-subtle">
            {disabledReason || "Unavailable"}
          </p>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept={accept}
            disabled={pending}
            onChange={(e) => onFileChange(e.target.files)}
            className="block w-full text-xs text-foreground-muted file:mr-3 file:border file:border-[#262626] file:bg-[#141414] file:px-3 file:py-1.5 file:text-[10px] file:uppercase file:tracking-widest file:text-white hover:file:border-accent disabled:opacity-40"
          />

          <label className="block space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
              Or paste URL / path
            </span>
            <input
              type="text"
              value={url}
              required={required && !disabled}
              onChange={(e) => {
                commit(e.target.value, "");
              }}
              placeholder="https://… or /media/…"
              className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </label>
        </>
      )}

      {pending ? (
        <p className="font-mono text-[10px] text-foreground-muted">Uploading…</p>
      ) : null}
      {error ? <p className="font-mono text-[10px] text-red-400">{error}</p> : null}
      {url && !pending && !disabled ? (
        <p className="font-mono text-[10px] text-accent/80 truncate" title={url}>
          {url}
        </p>
      ) : null}
    </div>
  );
}
