"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageOff } from "lucide-react";
import api from "@/lib/axios";
import API from "@/lib/endpoints";
import { classNames } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif";
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Single-image uploader backed by `POST /api/uploads`.
 *
 * That route is not implemented in the layan-salon backend yet (it needs multer +
 * the Cloudinary SDK), so a submit returns 404. This handles that explicitly and
 * falls back to a plain URL field so the rest of the profile builder still works
 * — an owner can paste an image URL and carry on.
 */
export default function ImageUploader({ value, onChange, label = "Image", hint, aspect = "aspect-[4/3]", disabled = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadUnavailable, setUploadUnavailable] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That file is not an image");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Images must be 5 MB or smaller");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    setProgress(30);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await api.post(API.uploads, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      // Backend answers `{ url, publicId }` once implemented.
      const url = result?.url ?? result?.image?.url ?? null;
      if (!url) throw new Error("The upload response did not include a URL");
      onChange?.(url);
      setProgress(100);
    } catch (uploadError) {
      // 404/405 means the route is not there yet — offer the URL fallback instead
      // of leaving the user with a dead control.
      if (uploadError.status === 404 || uploadError.status === 405) {
        setUploadUnavailable(true);
        setError(
          "The backend image-upload route is not implemented yet, so uploading is disabled. Paste an image URL below instead."
        );
      } else {
        setError(uploadError.message || "Upload failed");
      }
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const shown = value || preview;

  return (
    <div>
      <span className="label">{label}</span>

      <div
        className={classNames(
          "relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/50",
          aspect
        )}
      >
        {shown ? (
          <>
            <Image
              src={shown}
              alt={`${label} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              unoptimized
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setPreview(null);
                  setError(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-surface/95 p-1.5 shadow-card hover:text-danger"
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <ImageOff size={22} className="text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No image yet</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/85">
            <Loader2 size={22} className="animate-spin text-accent" aria-hidden="true" />
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">Uploading {progress}%</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
        aria-label={`Upload ${label.toLowerCase()}`}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading || uploadUnavailable}
          className="btn-outline btn-sm flex-1"
        >
          <Upload size={14} aria-hidden="true" />
          {uploadUnavailable ? "Upload unavailable" : "Upload a file"}
        </button>
        <input
          type="url"
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="…or paste an image URL"
          disabled={disabled}
          aria-label={`${label} URL`}
          className="input py-2 text-xs"
        />
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="hint mt-2">{hint}</p>}
    </div>
  );
}
