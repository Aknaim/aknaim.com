import { createOrUpdateGalleryItem } from "@/lib/actions/admin/gallery";
import type { AdminGalleryItem } from "@/lib/db/queries/admin-gallery";
import { AdminField, AdminSelect, AdminTextarea } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

interface GalleryAdminFormProps {
  item?: AdminGalleryItem;
}

export function GalleryAdminForm({ item }: GalleryAdminFormProps) {
  return (
    <form action={createOrUpdateGalleryItem} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminField label="Id" name="id" defaultValue={item?.id} placeholder="auto-from-title" />
        <AdminSelect
          label="Interest"
          name="interest"
          required
          defaultValue={item?.interest ?? "climbing"}
          options={[
            { id: "climbing", label: "Climbing" },
            { id: "travel", label: "Travel" },
            { id: "cooking", label: "Cooking" },
          ]}
        />
        <AdminField label="Title" name="title" defaultValue={item?.title ?? ""} />
        <AdminField
          label="Date taken (YYYY-MM-DD)"
          name="dateTaken"
          required
          defaultValue={item?.dateTaken}
        />
        <AdminField
          label="Recipe slug (optional)"
          name="recipeSlug"
          defaultValue={item?.recipeSlug ?? ""}
          hint="Cooking only. Leave blank for a photo-only plate — no recipe page link."
        />
        <AdminField
          label="Duration label"
          name="durationLabel"
          defaultValue={item?.durationLabel ?? ""}
          placeholder="0:38"
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
      </div>

      <MediaUploadField
        name="mediaUrl"
        idFieldName="mediaAssetId"
        label="Media"
        folder={`gallery/${item?.interest ?? "climbing"}`}
        defaultUrl={item?.mediaUrl}
        defaultMediaId={item?.mediaAssetId}
        required={!item}
      />

      <AdminTextarea
        label="Filters JSON"
        name="filtersJson"
        rows={6}
        defaultValue={JSON.stringify(item?.filters ?? {}, null, 2)}
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
