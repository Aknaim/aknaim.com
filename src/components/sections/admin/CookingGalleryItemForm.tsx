"use client";

import { useMemo, useState } from "react";
import { createOrUpdateGalleryItem } from "@/lib/actions/admin/gallery";
import { getGalleryFilterFields } from "@/lib/admin/gallery-form";
import type { AdminGalleryItem } from "@/lib/db/queries/admin-gallery";
import { AdminDateField, AdminField, AdminSelect } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

/** Edit a single cooking gallery photo from Cooking admin. */
export function CookingGalleryItemForm({ item }: { item: AdminGalleryItem }) {
  const filterFields = useMemo(() => getGalleryFilterFields("cooking"), []);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => ({ ...(item.filters ?? {}) })
  );

  return (
    <form action={createOrUpdateGalleryItem} className="space-y-6">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="interest" value="cooking" />
      <input type="hidden" name="returnTo" value="/admin/recipes" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminField label="Title" name="title" defaultValue={item.title ?? ""} />
        <AdminDateField label="Date taken" name="dateTaken" required defaultValue={item.dateTaken} />
        <AdminSelect
          label="Published"
          name="published"
          defaultValue={item.published === false ? "false" : "true"}
          options={[
            { id: "true", label: "Published" },
            { id: "false", label: "Draft" },
          ]}
        />
        <AdminField
          label="Recipe slug (optional)"
          name="recipeSlug"
          defaultValue={item.recipeSlug ?? ""}
          hint="Leave blank for a photo-only plate."
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
          label="Sort order"
          name="sortOrder"
          defaultValue={String(item.sortOrder ?? 0)}
        />
      </div>

      <MediaUploadField
        name="mediaUrl"
        idFieldName="mediaAssetId"
        label="Photo"
        folder="gallery/cooking"
        defaultUrl={item.mediaUrl}
        defaultMediaId={item.mediaAssetId}
        required
      />

      <button
        type="submit"
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
      >
        Save photo
      </button>
    </form>
  );
}
