import {
  finalizeMediaUpload,
  prepareMediaUpload,
  uploadMediaAsset,
  type UploadMediaResult,
} from "@/lib/actions/admin/media";
import { convertImageFileToWebp } from "@/lib/media/convert-image-client";
import { toWebpFileName } from "@/lib/media/webp-name";

export type ClientUploadProgress = {
  phase: "convert" | "sign" | "upload" | "save";
  /** 0–1 while phase === "upload" */
  fraction?: number;
  label: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function putFileToUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (fraction: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(
        new Error(
          `R2 upload failed (${xhr.status}). If this persists, add CORS PUT for your site origin on the R2 bucket.`
        )
      );
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Network error uploading to R2. Check the bucket CORS policy allows PUT from this site."
        )
      );
    xhr.send(file);
  });
}

/**
 * Upload admin media: images → WebP in browser; R2 → direct PUT; local → server action.
 */
export async function uploadAdminMediaFile(input: {
  file: File;
  folder: string;
  alt: string;
  fileName?: string;
  posterUrl?: string;
  durationLabel?: string;
  onProgress?: (progress: ClientUploadProgress) => void;
}): Promise<UploadMediaResult> {
  const { onProgress } = input;
  onProgress?.({ phase: "convert", label: "Preparing…" });

  const file = await convertImageFileToWebp(input.file);
  const fileName = input.fileName
    ? (toWebpFileName(input.fileName) ?? input.fileName)
    : undefined;
  const contentType = file.type || "application/octet-stream";
  const sizeLabel = formatBytes(file.size);

  onProgress?.({ phase: "sign", label: `Requesting upload slot (${sizeLabel})…` });

  const prepareData = new FormData();
  prepareData.set("folder", input.folder);
  prepareData.set("filename", file.name);
  prepareData.set("contentType", contentType);
  if (fileName) prepareData.set("fileName", fileName);

  const prepared = await prepareMediaUpload(prepareData);
  if (!prepared.ok) return prepared;

  if (prepared.mode === "r2-direct") {
    onProgress?.({
      phase: "upload",
      fraction: 0,
      label: `Uploading to R2… 0% of ${sizeLabel}`,
    });
    try {
      await putFileToUrl(prepared.uploadUrl, file, prepared.contentType, (fraction) => {
        onProgress?.({
          phase: "upload",
          fraction,
          label: `Uploading to R2… ${Math.round(fraction * 100)}% of ${sizeLabel}`,
        });
      });
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Direct R2 upload failed.",
      };
    }

    onProgress?.({ phase: "save", label: "Saving media record…" });
    const finalizeData = new FormData();
    finalizeData.set("url", prepared.publicUrl);
    finalizeData.set("alt", input.alt);
    finalizeData.set("contentType", prepared.contentType);
    finalizeData.set("filename", file.name);
    if (input.posterUrl) finalizeData.set("posterUrl", input.posterUrl);
    if (input.durationLabel) finalizeData.set("durationLabel", input.durationLabel);
    return finalizeMediaUpload(finalizeData);
  }

  onProgress?.({ phase: "upload", label: `Uploading via server (${sizeLabel})…` });
  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", input.folder);
  formData.set("alt", input.alt);
  if (fileName) formData.set("fileName", fileName);
  if (input.posterUrl) formData.set("posterUrl", input.posterUrl);
  if (input.durationLabel) formData.set("durationLabel", input.durationLabel);
  return uploadMediaAsset(formData);
}
