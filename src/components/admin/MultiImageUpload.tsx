"use client";

import { Plus } from "lucide-react";
import { CloudinaryUpload } from "./CloudinaryUpload";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  alt?: string;
}

/**
 * Multi-image uploader — renders one CloudinaryUpload slot per filled URL,
 * plus an "add slot" button (when below max). Empty URLs are pruned.
 */
export function MultiImageUpload({ value, onChange, max = 6, alt = "Image" }: Props) {
  const urls = value.filter(Boolean);

  const setAt = (i: number, url: string) => {
    const next = [...urls];
    if (url) next[i] = url;
    else next.splice(i, 1);
    onChange(next);
  };

  const addSlot = () => {
    if (urls.length < max) onChange([...urls, ""]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {urls.map((url, i) => (
          <div key={i} className="relative">
            <CloudinaryUpload
              value={url}
              onChange={(next) => setAt(i, next)}
              alt={`${alt} ${i + 1}`}
            />
          </div>
        ))}

        {/* Add slot button — hidden once max reached */}
        {urls.length < max && (
          <button
            type="button"
            onClick={addSlot}
            className="flex aspect-square min-h-[120px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-600"
          >
            <Plus className="h-5 w-5" />
            Add Image
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {urls.length} / {max} images — shown as a carousel on the vehicle detail page.
      </p>
    </div>
  );
}
