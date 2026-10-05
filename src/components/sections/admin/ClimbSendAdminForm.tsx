"use client";

import { useMemo, useRef, useState } from "react";
import { createOrUpdateClimbingSend } from "@/lib/actions/admin/climbing";
import { uploadMediaAsset } from "@/lib/actions/admin/media";
import {
  CLIMB_COLOR_OPTIONS,
  gradesForClimbType,
  type ClimbType,
} from "@/lib/climbing-grades";
import type { AdminClimbingSend } from "@/lib/db/queries/climbing";
import { AdminSelect } from "./AdminField";
import { MediaUploadField } from "./MediaUploadField";

interface ClimbSendAdminFormProps {
  send?: AdminClimbingSend;
  locations: Array<{ id: string; name: string }>;
  gradeUrl?: string;
  videoUrl?: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDurationLabel(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "";
  const seconds = Math.round(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function dateFromFile(file: File): string {
  const d = new Date(file.lastModified);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read video metadata"));
    };
    video.src = objectUrl;
  });
}

/** Grab a JPEG poster frame from near the start of a send video. */
function captureVideoPoster(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadeddata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 1;
      video.currentTime = Math.min(0.8, Math.max(0.1, duration * 0.15));
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx || !canvas.width || !canvas.height) {
          cleanup();
          reject(new Error("Could not capture video frame"));
          return;
        }
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              reject(new Error("Could not encode poster frame"));
              return;
            }
            resolve(new File([blob], "still.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.9
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Could not load video for poster frame"));
    };

    video.src = objectUrl;
  });
}

export function ClimbSendAdminForm({
  send,
  locations,
  gradeUrl = "",
  videoUrl = "",
}: ClimbSendAdminFormProps) {
  const [routeName, setRouteName] = useState(send?.routeName ?? "");
  const [color, setColor] = useState(send?.color ?? "");
  const [climbType, setClimbType] = useState<ClimbType>(send?.type ?? "top-rope");
  const [grade, setGrade] = useState(send?.grade ?? "5.12");
  const [sessionDate, setSessionDate] = useState(send?.sessionDate ?? "");
  const [durationLabel, setDurationLabel] = useState(
    send?.durationLabel === "—" ? "" : (send?.durationLabel ?? "")
  );
  const [metaNote, setMetaNote] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [stillUrl, setStillUrl] = useState(send?.imageSrc ?? "");
  const [stillMediaId, setStillMediaId] = useState("");
  const [posterBusy, setPosterBusy] = useState(false);
  const stillUrlRef = useRef(stillUrl);
  stillUrlRef.current = stillUrl;

  // Folder id always follows current name + color. Save migrates the old folder if needed.
  const climbSlug = useMemo(
    () => slugify(`${routeName}${color ? `-${color}` : ""}`),
    [routeName, color]
  );
  const mediaFolder = `climbing/${climbSlug || "inbox"}`;
  const gradeOptions = gradesForClimbType(climbType);
  const folderWillRename = Boolean(send?.slug && climbSlug && send.slug !== climbSlug);

  function handleTypeChange(nextType: ClimbType) {
    setClimbType(nextType);
    const options = gradesForClimbType(nextType);
    if (!options.some((option) => option.id === grade)) {
      setGrade(options[Math.min(8, options.length - 1)]?.id ?? options[0]?.id ?? "");
    }
  }

  async function handleVideoSelected(file: File) {
    setFormError(null);
    const fromFile = dateFromFile(file);
    if (fromFile) setSessionDate(fromFile);

    let durationNote = "";
    try {
      const seconds = await readVideoDurationSeconds(file);
      const label = formatDurationLabel(seconds);
      if (label) {
        setDurationLabel(label);
        durationNote = `duration (${label})`;
      }
    } catch {
      durationNote = "";
    }

    // If there's no photo yet, pull a poster frame from the send video.
    if (!stillUrlRef.current) {
      setPosterBusy(true);
      try {
        const poster = await captureVideoPoster(file);
        const formData = new FormData();
        formData.set("file", poster);
        formData.set("folder", mediaFolder);
        formData.set("alt", "Photo");
        formData.set("fileName", "still.webp");
        const uploaded = await uploadMediaAsset(formData);
        if (!uploaded.ok) {
          setMetaNote(
            `Video uploaded, but poster failed (${uploaded.error}). Add a photo manually.`
          );
        } else {
          setStillUrl(uploaded.url);
          setStillMediaId(uploaded.id);
          const parts = [
            fromFile ? `date (${fromFile})` : null,
            durationNote || null,
            "photo from video frame",
          ].filter(Boolean);
          setMetaNote(`Filled ${parts.join(", ")} from the send video.`);
        }
      } catch {
        setMetaNote(
          fromFile
            ? `Filled date (${fromFile})${durationNote ? ` and ${durationNote}` : ""}. Add a photo — auto poster failed.`
            : "Could not auto-create a photo from the video — upload a still manually."
        );
      } finally {
        setPosterBusy(false);
      }
      return;
    }

    setMetaNote(
      fromFile
        ? `Filled date (${fromFile})${durationNote ? ` and ${durationNote}` : ""} from the video file.`
        : durationNote
          ? `Filled ${durationNote} from the video file.`
          : "Could not read date/duration from the video — enter them manually."
    );
  }

  return (
    <form
      action={createOrUpdateClimbingSend}
      className="space-y-6"
      onSubmit={(event) => {
        if (posterBusy) {
          event.preventDefault();
          setFormError("Still creating photo from the video — wait a moment, then save.");
          return;
        }
        if (!stillUrl.trim()) {
          event.preventDefault();
          setFormError(
            "Photo is required. Upload a still, or upload the send video and wait for the auto poster."
          );
          return;
        }
        if (locations.length === 0) {
          event.preventDefault();
          setFormError("Add a climbing location first (seed DB or create one in admin).");
          return;
        }
        setFormError(null);
      }}
    >
      <input type="hidden" name="sortOrder" value={String(send?.sortOrder ?? 0)} />
      {send?.slug ? <input type="hidden" name="existingSlug" value={send.slug} /> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Route name
          </span>
          <input
            name="routeName"
            required
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="Halloween"
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          <span className="font-mono text-[9px] text-foreground-subtle">
            Folder: {climbSlug || "…"}
            {folderWillRename ? ` (will rename from ${send?.slug} on save)` : ""}
          </span>
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Color
          </span>
          <select
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            {CLIMB_COLOR_OPTIONS.map((option) => (
              <option key={option.id || "none"} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <AdminSelect
          label="Location"
          name="locationId"
          required
          defaultValue={send?.locationId ?? locations[0]?.id}
          options={locations.map((l) => ({ id: l.id, label: l.name }))}
        />
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Type
          </span>
          <select
            name="type"
            value={climbType}
            onChange={(e) => handleTypeChange(e.target.value as ClimbType)}
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            <option value="top-rope">Top Rope</option>
            <option value="lead">Lead</option>
            <option value="bouldering">Bouldering</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Grade
          </span>
          <select
            name="grade"
            required
            value={gradeOptions.some((o) => o.id === grade) ? grade : gradeOptions[0]?.id}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            {gradeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <AdminSelect
          label="Result"
          name="result"
          defaultValue={send?.result ?? "send"}
          options={[
            { id: "onsight", label: "Onsight" },
            { id: "flash", label: "Flash" },
            { id: "redpoint", label: "Redpoint" },
            { id: "send", label: "Send" },
            { id: "one-hang", label: "One hang" },
            { id: "project", label: "Project" },
          ]}
        />
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Session date
          </span>
          <input
            type="date"
            name="sessionDate"
            required
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          <span className="font-mono text-[9px] text-foreground-subtle">
            Auto-filled from the video file date when you upload send.mp4
          </span>
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Duration
          </span>
          <input
            name="durationLabel"
            value={durationLabel}
            onChange={(e) => setDurationLabel(e.target.value)}
            placeholder="0:38"
            className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          <span className="font-mono text-[9px] text-foreground-subtle">
            Auto-filled from the video length when you upload send.mp4
          </span>
        </label>
      </div>

      {metaNote ? (
        <p className="font-mono text-[10px] text-accent/80">{metaNote}</p>
      ) : null}
      {formError ? (
        <p className="font-mono text-[10px] text-red-400">{formError}</p>
      ) : null}
      {posterBusy ? (
        <p className="font-mono text-[10px] text-foreground-muted">
          Creating photo from video frame…
        </p>
      ) : null}

      <p className="font-mono text-[10px] text-foreground-subtle">
        Files go to{" "}
        <span className="text-foreground-muted">public/media/{mediaFolder}/</span>
        . Video alone is fine — a poster frame is grabbed automatically if Photo is empty.
        Grade card is optional.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MediaUploadField
          name="stillUrl"
          idFieldName="stillMediaId"
          label="Photo"
          folder={mediaFolder}
          fileName="still.webp"
          accept="image/*"
          defaultUrl={send?.imageSrc}
          required={!send}
          externalUrl={stillUrl}
          externalMediaId={stillMediaId}
          onAssetChange={({ url, mediaId }) => {
            setStillUrl(url);
            setStillMediaId(mediaId);
          }}
        />
        <MediaUploadField
          name="gradeUrl"
          idFieldName="gradeMediaId"
          label="Grade card (optional)"
          folder={mediaFolder}
          fileName="grade.webp"
          accept="image/*"
          defaultUrl={gradeUrl}
        />
        <MediaUploadField
          name="videoUrl"
          idFieldName="videoMediaId"
          label="Send video"
          folder={mediaFolder}
          fileName="send.mp4"
          accept="video/mp4,video/webm"
          defaultUrl={videoUrl}
          onFileSelected={handleVideoSelected}
        />
      </div>

      <button
        type="submit"
        disabled={posterBusy}
        className="border border-[#262626] bg-[#141414] px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:border-accent transition-colors disabled:opacity-40"
      >
        Save climb
      </button>
    </form>
  );
}
