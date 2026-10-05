"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaAsset } from "@/lib/actions/admin/media";

export function MediaUploadForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await uploadMediaAsset(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(`Uploaded ${result.url}`);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="border border-[#141414] bg-[#0c0c0c] p-4 space-y-4">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        Upload to R2
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            File
          </span>
          <input
            type="file"
            name="file"
            required
            disabled={disabled || pending}
            accept="image/*,video/mp4,video/webm"
            className="block w-full text-xs text-foreground-muted"
          />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Folder prefix
          </span>
          <input
            name="folder"
            defaultValue="uploads"
            disabled={disabled || pending}
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="block space-y-2 md:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Alt text
          </span>
          <input
            name="alt"
            disabled={disabled || pending}
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={disabled || pending}
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors disabled:opacity-40"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
      {error ? <p className="font-mono text-[10px] text-red-400">{error}</p> : null}
      {message ? <p className="font-mono text-[10px] text-accent">{message}</p> : null}
    </form>
  );
}
