"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createGalleryItemsBatch } from "@/lib/actions/admin/gallery";
import {
  getGalleryFilterFields,
  titleFromFileName,
} from "@/lib/admin/gallery-form";
import { uploadAdminMediaFile } from "@/lib/media/upload-client";
import { AdminDateField, AdminField, AdminSelect } from "./AdminField";

type StagedFile = {
  key: string;
  file: File;
  title: string;
  dateTaken: string;
  previewUrl: string;
};

function isoFromFile(file: File): string {
  const d = new Date(file.lastModified);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function CookingGalleryDumpForm() {
  const router = useRouter();
  const filterFields = useMemo(() => getGalleryFilterFields("cooking"), []);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [defaultDate, setDefaultDate] = useState("");
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFilesPicked(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next = Array.from(fileList).map((file, index) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      file,
      title: titleFromFileName(file.name),
      dateTaken: defaultDate || isoFromFile(file),
      previewUrl: URL.createObjectURL(file),
    }));
    setStaged((current) => [...current, ...next]);
  }

  function removeStaged(key: string) {
    setStaged((current) => {
      const target = current.find((row) => row.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((row) => row.key !== key);
    });
  }

  function updateStaged(key: string, patch: Partial<Pick<StagedFile, "title" | "dateTaken">>) {
    setStaged((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function applyDefaultDateToAll() {
    if (!defaultDate) return;
    setStaged((current) =>
      current.map((row) => ({ ...row, dateTaken: defaultDate }))
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (staged.length === 0) {
      setError("Add at least one photo.");
      return;
    }

    for (const [index, row] of staged.entries()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dateTaken)) {
        setError(`Photo ${index + 1} needs a date.`);
        return;
      }
    }

    const data = new FormData(event.currentTarget);
    const recipeSlug = String(data.get("recipeSlug") ?? "").trim() || null;
    const published = String(data.get("published") ?? "true") === "true";

    const filters: Record<string, string> = {};
    for (const field of filterFields) {
      const value = filterValues[field.key]?.trim();
      if (value) filters[field.key] = value;
    }

    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        const uploaded: Array<{
          mediaUrl: string;
          mediaAssetId: string;
          title: string;
          dateTaken: string;
        }> = [];

        for (const [index, row] of staged.entries()) {
          setStatus(`Uploading ${index + 1} of ${staged.length}…`);
          const result = await uploadAdminMediaFile({
            file: row.file,
            folder: "gallery/cooking",
            alt: row.title || "Cooking",
            onProgress: (progress) =>
              setStatus(`Uploading ${index + 1}/${staged.length} · ${progress.label}`),
          });
          if (!result.ok) {
            setError(result.error);
            setStatus(null);
            return;
          }
          uploaded.push({
            mediaUrl: result.url,
            mediaAssetId: result.id,
            title: row.title.trim(),
            dateTaken: row.dateTaken,
          });
        }

        setStatus("Saving gallery items…");
        const saved = await createGalleryItemsBatch({
          interest: "cooking",
          defaultDateTaken: defaultDate || undefined,
          filters,
          recipeSlug,
          published,
          items: uploaded,
        });

        if (!saved.ok) {
          setError(saved.error);
          setStatus(null);
          return;
        }

        for (const row of staged) URL.revokeObjectURL(row.previewUrl);
        setStaged([]);
        router.push(`/admin/recipes?photos=${saved.count}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        setStatus(null);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-[#141414] bg-[#0c0c0c] p-5">
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Gallery dump
        </h2>
        <p className="text-sm text-foreground-muted mt-2 max-w-xl">
          Drop finished plates here — each photo has its own date. Optional category,
          cuisine, and recipe link apply to the whole batch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <AdminDateField
            label="Default date (optional)"
            name="defaultDateTaken"
            value={defaultDate}
            onChange={(e) => setDefaultDate(e.target.value)}
            hint="Prefills new picks. Leave blank to use each file’s modified date."
          />
          {staged.length > 0 && defaultDate ? (
            <button
              type="button"
              onClick={applyDefaultDateToAll}
              className="font-mono text-[10px] uppercase tracking-widest text-accent/80 hover:text-accent"
            >
              Apply default to all staged
            </button>
          ) : null}
        </div>
        <AdminSelect
          label="Published"
          name="published"
          defaultValue="true"
          options={[
            { id: "true", label: "Published" },
            { id: "false", label: "Draft" },
          ]}
        />
        {filterFields.map((field) => (
          <AdminSelect
            key={field.key}
            label={field.label}
            name={`filter_${field.key}`}
            allowEmpty
            emptyLabel="Any / none"
            value={filterValues[field.key] ?? ""}
            onChange={(e) =>
              setFilterValues((current) => ({
                ...current,
                [field.key]: e.target.value,
              }))
            }
            options={field.options}
          />
        ))}
        <AdminField
          label="Recipe slug (optional)"
          name="recipeSlug"
          placeholder="sourdough-boule"
          hint="Only if this plate has a recipe page."
        />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted block">
          Photos
        </span>
        <input
          type="file"
          accept="image/*,video/mp4,video/webm"
          multiple
          disabled={pending}
          onChange={(e) => {
            onFilesPicked(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-xs text-foreground-muted file:mr-3 file:border file:border-[#262626] file:bg-[#141414] file:px-3 file:py-1.5 file:text-[10px] file:uppercase file:tracking-widest file:text-white hover:file:border-accent disabled:opacity-40"
        />
        <p className="font-mono text-[9px] text-foreground-subtle">
          Titles and dates are per photo — edit in the list before saving.
        </p>
      </div>

      {staged.length > 0 ? (
        <ul className="divide-y divide-[#141414] border border-[#141414]">
          {staged.map((row) => (
            <li
              key={row.key}
              className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
              <img
                src={row.previewUrl}
                alt=""
                className="h-16 w-16 object-cover border border-[#262626] bg-[#070707] shrink-0"
              />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
                    Title
                  </span>
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => updateStaged(row.key, { title: e.target.value })}
                    className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-subtle">
                    Date
                  </span>
                  <input
                    type="date"
                    value={row.dateTaken}
                    onChange={(e) => updateStaged(row.key, { dateTaken: e.target.value })}
                    required
                    className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent [color-scheme:dark]"
                  />
                </label>
                <p className="font-mono text-[9px] text-foreground-subtle truncate sm:col-span-2">
                  {row.file.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeStaged(row.key)}
                className="font-mono text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {status ? (
        <p className="font-mono text-[10px] text-amber-400/90">{status}</p>
      ) : null}
      {error ? <p className="font-mono text-[10px] text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={pending || staged.length === 0}
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors disabled:opacity-40"
      >
        {pending
          ? "Saving…"
          : staged.length > 0
            ? `Add ${staged.length} photo${staged.length === 1 ? "" : "s"}`
            : "Add photos"}
      </button>
    </form>
  );
}
