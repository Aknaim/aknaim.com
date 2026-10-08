"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createOrUpdateTravelPlace,
  type TravelPlaceSaveState,
} from "@/lib/actions/admin/travel";
import { tripMediaPaths } from "@/lib/media/trip-paths";
import type { Destination } from "@/lib/travelData";
import type { TripDetail } from "@/lib/types/travel";
import { toInputDate } from "@/lib/dates";
import { AdminDateField, AdminField, AdminTextarea } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";
import { MultiMediaUploadField } from "./MultiMediaUploadField";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MOMENT_SLOTS = 4;

/** One place = one map card + optional detail page when a summary is present. */
export function TravelPlaceAdminForm({
  destination,
  trip,
  saved = false,
}: {
  destination?: Destination;
  trip?: TripDetail | null;
  saved?: boolean;
}) {
  const [title, setTitle] = useState(destination?.title ?? "");
  const [idOverride, setIdOverride] = useState(destination?.id ?? "");
  const placeId = idOverride || slugify(title) || "inbox";
  const paths = useMemo(() => tripMediaPaths(placeId), [placeId]);
  const moments = Array.from({ length: MOMENT_SLOTS }, (_, index) => trip?.moments[index]);
  const [routePlaces, setRoutePlaces] = useState<string[]>(() => {
    const existing = trip?.route.stops.map((stop) => stop.name) ?? [];
    return existing.length > 0 ? existing : [""];
  });
  const [uploadsPending, setUploadsPending] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveState, formAction, saving] = useActionState<TravelPlaceSaveState, FormData>(
    createOrUpdateTravelPlace,
    null
  );
  const filledStops = routePlaces.filter((place) => place.trim()).length;

  function trackUploadPending(pending: boolean) {
    setUploadsPending((count) => Math.max(0, count + (pending ? 1 : -1)));
  }

  const busy = uploadsPending > 0 || saving;

  return (
    <form
      action={formAction}
      className="space-y-10"
      onSubmit={(event) => {
        if (uploadsPending > 0) {
          event.preventDefault();
          setFormError("Wait for uploads to finish before saving.");
          return;
        }
        setFormError(null);
      }}
    >
      {saved ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Saved — you&apos;re on the edit page for this place.
        </p>
      ) : null}

      <section className="space-y-6">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Place card
          </h2>
          <p className="font-mono text-[9px] text-foreground-subtle mt-1">
            Required for /travel. Media folder:{" "}
            <span className="text-foreground-muted">/{paths.root}/</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField
            label="Title"
            name="title"
            required
            defaultValue={destination?.title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <AdminField
            label="Id (url slug)"
            name="id"
            defaultValue={destination?.id}
            placeholder="auto-from-title"
            onChange={(event) => setIdOverride(event.target.value)}
          />
          <AdminDateField
            label="Date"
            name="occurredOn"
            required
            defaultValue={toInputDate(destination?.date ?? trip?.date)}
            hint="Same date picker as climbs — shown as month/year on the travel map."
          />
          <AdminField
            label="World-map pin X %"
            name="mapX"
            defaultValue={String(destination?.mapCoordinates.x ?? 50)}
          />
          <AdminField
            label="World-map pin Y %"
            name="mapY"
            defaultValue={String(destination?.mapCoordinates.y ?? 50)}
          />
        </div>

        <MediaUploadField
          name="imageUrl"
          idFieldName="imageMediaId"
          label="Highlight image (travel page card)"
          folder={paths.highlightFolder}
          fileName={paths.highlightFile}
          accept="image/*"
          defaultUrl={destination?.imageSrc}
          required={!destination}
          onPendingChange={trackUploadPending}
        />
      </section>

      <section className="space-y-6 border-t border-[#141414] pt-8">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Detail page
          </h2>
          <p className="font-mono text-[9px] text-foreground-subtle mt-1">
            Fill a summary to publish /travel/{placeId === "inbox" ? "[id]" : placeId}. Leave
            summary empty for card-only (“Coming soon”). Hero and route map are optional —
            highlight is used when hero is blank; route map can wait.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField
            label="Days"
            name="days"
            type="number"
            defaultValue={trip?.stats.days ? String(trip.stats.days) : ""}
            placeholder="e.g. 10"
          />
        </div>
        <p className="font-mono text-[9px] text-foreground-subtle">
          Stops = filled cities below. Photos come from gallery uploads.
        </p>

        <AdminTextarea
          label="Summary (required to publish detail)"
          name="summary"
          defaultValue={trip?.summary}
          rows={3}
        />
        <AdminTextarea
          label="Route note"
          name="routeNote"
          defaultValue={trip?.route.note ?? ""}
          rows={2}
        />

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                Route cities
              </h3>
              <p className="font-mono text-[9px] text-foreground-subtle mt-1">
                Shown as City → City. {filledStops} stop{filledStops === 1 ? "" : "s"}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRoutePlaces((places) => [...places, ""])}
              className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
            >
              + Add city
            </button>
          </div>
          <div className="space-y-2">
            {routePlaces.map((place, index) => (
              <div key={`route-place-${index}`} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-foreground-subtle w-5 shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  name={`routePlace_${index}`}
                  value={place}
                  onChange={(event) => {
                    const value = event.target.value;
                    setRoutePlaces((places) =>
                      places.map((entry, i) => (i === index ? value : entry))
                    );
                  }}
                  placeholder="City or place name"
                  className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
                />
                <button
                  type="button"
                  disabled={routePlaces.length <= 1}
                  onClick={() =>
                    setRoutePlaces((places) => places.filter((_, i) => i !== index))
                  }
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle hover:text-red-400 transition-colors disabled:opacity-30"
                  aria-label={`Remove city ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MediaUploadField
            name="heroUrl"
            idFieldName="heroMediaId"
            label="Hero (optional — defaults to highlight)"
            folder={paths.heroFolder}
            fileName={paths.heroFile}
            accept="image/*"
            defaultUrl={trip?.heroImage}
            onPendingChange={trackUploadPending}
          />
          <MediaUploadField
            name="routeMapUrl"
            idFieldName="routeMapMediaId"
            label="Route map (optional)"
            folder={paths.mapFolder}
            fileName={paths.mapFile}
            accept="image/*"
            defaultUrl={
              trip?.route.mapImage &&
              trip.route.mapImage.split("?")[0] !== (trip.heroImage ?? "").split("?")[0]
                ? trip.route.mapImage
                : ""
            }
            onPendingChange={trackUploadPending}
          />
        </div>

        <section className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Moments along the way
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moments.map((moment, index) => (
              <div key={`moment-${index}`} className="space-y-3 border border-[#141414] p-4">
                <AdminField
                  label={`Moment ${index + 1} title`}
                  name={`momentTitle_${index}`}
                  defaultValue={moment?.title ?? ""}
                />
                <MediaUploadField
                  name={`momentUrl_${index}`}
                  idFieldName={`momentMediaId_${index}`}
                  label="Cover"
                  folder={paths.momentsFolder}
                  accept="image/*"
                  defaultUrl={moment?.imageSrc}
                  onPendingChange={trackUploadPending}
                />
              </div>
            ))}
          </div>
        </section>

        <MultiMediaUploadField
          name="galleryUploads"
          label="Gallery photos (multi-upload)"
          folder={paths.galleryFolder}
          accept="image/*"
          onPendingChange={trackUploadPending}
        />
      </section>

      {formError || saveState?.error ? (
        <p className="font-mono text-[10px] text-red-400">{formError || saveState?.error}</p>
      ) : null}
      {uploadsPending > 0 ? (
        <p className="font-mono text-[10px] text-amber-400/90">
          Uploading {uploadsPending} file{uploadsPending === 1 ? "" : "s"}… save unlocks when done.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors disabled:opacity-40"
      >
        {uploadsPending > 0 ? "Waiting for uploads…" : saving ? "Saving…" : "Save place"}
      </button>
    </form>
  );
}
