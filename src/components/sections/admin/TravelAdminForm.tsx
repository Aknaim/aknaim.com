import {
  createOrUpdateDestination,
  createOrUpdateTrip,
} from "@/lib/actions/admin/travel";
import type { Destination } from "@/lib/travelData";
import type { TripDetail } from "@/lib/types/travel";
import { AdminField, AdminTextarea } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

export function DestinationAdminForm({ destination }: { destination?: Destination }) {
  return (
    <form action={createOrUpdateDestination} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminField label="Title" name="title" required defaultValue={destination?.title} />
        <AdminField
          label="Id"
          name="id"
          defaultValue={destination?.id}
          placeholder="auto-from-title"
        />
        <AdminField
          label="Display number"
          name="displayNumber"
          required
          defaultValue={destination?.number}
        />
        <AdminField label="Subtitle" name="subtitle" defaultValue={destination?.subtitle ?? ""} />
        <AdminField label="Date label" name="dateLabel" required defaultValue={destination?.date} />
        <AdminField
          label="Photos count"
          name="photosCount"
          defaultValue={String(destination?.photosCount ?? 0)}
        />
        <AdminField
          label="Notes count"
          name="notesCount"
          defaultValue={String(destination?.notesCount ?? 0)}
        />
        <AdminField
          label="Map X"
          name="mapX"
          defaultValue={String(destination?.mapCoordinates.x ?? 50)}
        />
        <AdminField
          label="Map Y"
          name="mapY"
          defaultValue={String(destination?.mapCoordinates.y ?? 50)}
        />
      </div>
      <MediaUploadField
        name="imageUrl"
        idFieldName="imageMediaId"
        label="Destination image"
        folder={`travel/${destination?.id || "destinations"}`}
        accept="image/*"
        defaultUrl={destination?.imageSrc}
        required={!destination}
      />
      <button
        type="submit"
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
      >
        Save destination
      </button>
    </form>
  );
}

export function TripAdminForm({
  destinationId,
  trip,
}: {
  destinationId: string;
  trip?: TripDetail | null;
}) {
  return (
    <form action={createOrUpdateTrip} className="space-y-6 border-t border-[#141414] pt-8">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        Trip detail
      </h2>
      <input type="hidden" name="id" value={destinationId} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminField label="Country" name="country" required defaultValue={trip?.country} />
        <AdminField label="Date label" name="dateLabel" required defaultValue={trip?.date} />
        <AdminField
          label="Stat days"
          name="statDays"
          defaultValue={String(trip?.stats.days ?? 0)}
        />
        <AdminField
          label="Stat regions"
          name="statRegions"
          defaultValue={String(trip?.stats.regions ?? 0)}
        />
        <AdminField
          label="Stat photos"
          name="statPhotos"
          defaultValue={String(trip?.stats.photos ?? 0)}
        />
        <AdminField
          label="Stat countries"
          name="statCountries"
          defaultValue={String(trip?.stats.countries ?? 1)}
        />
        <AdminField
          label="Reflection slug"
          name="reflectionSlug"
          defaultValue={trip?.reflection.slug ?? `${destinationId}-reflection`}
        />
      </div>
      <AdminTextarea label="Summary" name="summary" required defaultValue={trip?.summary} rows={4} />
      <AdminTextarea
        label="Reflection excerpt"
        name="reflectionExcerpt"
        defaultValue={trip?.reflection.excerpt}
        rows={3}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MediaUploadField
          name="heroUrl"
          idFieldName="heroMediaId"
          label="Hero"
          folder={`travel/${destinationId}`}
          accept="image/*"
          defaultUrl={trip?.heroImage}
          required={!trip}
        />
        <MediaUploadField
          name="routeMapUrl"
          idFieldName="routeMapMediaId"
          label="Route map"
          folder={`travel/${destinationId}`}
          accept="image/*"
          defaultUrl={trip?.route.mapImage}
        />
        <MediaUploadField
          name="gearUrl"
          idFieldName="gearMediaId"
          label="Gear"
          folder={`travel/${destinationId}`}
          accept="image/*"
          defaultUrl={trip?.gearImage}
        />
      </div>
      <button
        type="submit"
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors"
      >
        Save trip
      </button>
    </form>
  );
}
