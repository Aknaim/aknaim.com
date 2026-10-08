"use client";

import { useMemo, useState } from "react";
import { createOrUpdateGalleryItem } from "@/lib/actions/admin/gallery";
import {
  getGalleryFilterFields,
  isGalleryInterest,
} from "@/lib/admin/gallery-form";
import type { AdminGalleryItem } from "@/lib/db/queries/admin-gallery";
import type { GalleryInterest } from "@/lib/types/gallery";
import { AdminDateField, AdminField, AdminSelect } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

type TravelTripOption = { id: string; label: string };

interface GalleryAdminFormProps {
  item?: AdminGalleryItem;
  defaultInterest?: GalleryInterest;
  travelTrips?: TravelTripOption[];
}

/** Single-item create/edit. Multi cooking dumps live on Cooking admin. */
export function GalleryAdminForm({
  item,
  defaultInterest = "cooking",
  travelTrips = [],
}: GalleryAdminFormProps) {
  const [interest, setInterest] = useState<GalleryInterest>(
    item?.interest ?? defaultInterest
  );
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => ({ ...(item?.filters ?? {}) })
  );

  const filterFields = useMemo(
    () => getGalleryFilterFields(interest, travelTrips),
    [interest, travelTrips]
  );

  function onInterestChange(next: string) {
    if (!isGalleryInterest(next)) return;
    setInterest(next);
    setFilterValues({});
  }

  return (
    <form action={createOrUpdateGalleryItem} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}

        <AdminSelect
          label="Interest"
          name="interest"
          required
          value={interest}
          onChange={(e) => onInterestChange(e.target.value)}
          options={[
            { id: "cooking", label: "Cooking" },
            { id: "climbing", label: "Climbing" },
            { id: "travel", label: "Travel" },
          ]}
        />

        <AdminField
          label="Title"
          name="title"
          defaultValue={item?.title ?? ""}
          placeholder="Optional"
        />

        <AdminDateField
          label="Date taken"
          name="dateTaken"
          required
          defaultValue={item?.dateTaken}
        />

        <AdminField
          label="Sort order"
          name="sortOrder"
          defaultValue={String(item?.sortOrder ?? 0)}
        />

        <AdminSelect
          label="Published"
          name="published"
          defaultValue={item?.published === false ? "false" : "true"}
          options={[
            { id: "true", label: "Published" },
            { id: "false", label: "Draft" },
          ]}
        />

        {interest === "cooking" ? (
          <AdminField
            label="Recipe slug (optional)"
            name="recipeSlug"
            defaultValue={item?.recipeSlug ?? ""}
          />
        ) : null}

        {interest === "climbing" ? (
          <AdminField
            label="Duration label"
            name="durationLabel"
            defaultValue={item?.durationLabel ?? ""}
            placeholder="0:38"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filterFields.map((field) => (
          <AdminSelect
            key={`${interest}-${field.key}`}
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
      </div>

      <MediaUploadField
        name="mediaUrl"
        idFieldName="mediaAssetId"
        label="Media"
        folder={`gallery/${interest}`}
        defaultUrl={item?.mediaUrl}
        defaultMediaId={item?.mediaAssetId}
        required={!item}
      />

      <button
        type="submit"
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
      >
        Save gallery item
      </button>
    </form>
  );
}
