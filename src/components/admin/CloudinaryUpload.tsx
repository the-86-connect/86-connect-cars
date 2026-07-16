"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { handleUpload, isCloudinaryConfigured } from "@/lib/cloudinary";

interface Props {
  /** Current URL — if set, shows a preview with a remove button. */
  value?: string;
  /** Called when upload succeeds (with new URL) or user clears. */
  onChange: (url: string) => void;
  /** Preview image alt text. */
  alt?: string;
}

/**
 * Reusable Cloudinary upload widget.
 * - Empty: shows dashed dropzone
 * - Uploading: progress bar
 * - Uploaded: preview + "use existing URL" fallback link
 */
export function CloudinaryUpload({ value, onChange, alt = "Upload" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const url = await handleUpload(file, setProgress);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  // Preview state: show uploaded URL if present.
  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative inline-flex overflow-hidden rounded-lg border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt} className="h-24 w-24 object-contain bg-gray-50" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="break-all text-xs text-gray-500">{value}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 transition-colors hover:border-brand-400 hover:bg-brand-50/40">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
            <span>Uploading… {progress}%</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            <span>Click to upload image (Cloudinary)</span>
          </>
        )}
      </label>

      {uploading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {!isCloudinaryConfigured() && (
        <p className="text-xs text-amber-600">
          Cloudinary env not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME & NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local.
        </p>
      )}

      {/* Manual URL fallback — useful for existing local filenames or external URLs. */}
      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://... or local-filename.png"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => { if (urlInput.trim()) { onChange(urlInput.trim()); setUrlInput(""); setShowUrlInput(false); } }}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
          >
            Use
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="text-xs text-gray-500 underline hover:text-gray-700"
        >
          Or paste URL manually
        </button>
      )}
    </div>
  );
}