"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { handleUpload } from "@/lib/cloudinary";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({ value, onChange, maxImages = 3 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (value.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const url = await handleUpload(file, setProgress);
      onChange([...value, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxImages]);

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxImages && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600 transition-colors hover:border-brand-400 hover:bg-brand-50/40">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
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
              <span>Add image ({value.length}/{maxImages})</span>
            </>
          )}
        </label>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}