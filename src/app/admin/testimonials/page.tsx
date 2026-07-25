"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, AlertCircle, CheckCircle2, X } from "lucide-react";
import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminTestimonials() {
  const [enabled, setEnabled] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/site-settings");
      const data = await res.json().catch(() => ({ testimonialsEnabled: true }));
      setEnabled(data.testimonialsEnabled !== false);
    } catch {
      setEnabled(true);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refresh(); }, [refresh]);

  // Auto-clear transient messages
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [error, success]);

  const handleToggle = async () => {
    setToggling(true);
    setError(null);
    const next = !enabled;
    setEnabled(next);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonialsEnabled: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      setSuccess(next
        ? "Testimonials section enabled — visible on the homepage."
        : "Testimonials section hidden from the homepage.");
    } catch (e) {
      setEnabled(!next);
      setError(e instanceof Error ? e.message : "Failed to toggle");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Transient messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <p className="flex-1 text-sm text-green-700">{success}</p>
          <button type="button" onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Visibility toggle */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${enabled ? "bg-emerald-50" : "bg-gray-100"}`}>
            <Star className={`h-5 w-5 ${enabled ? "text-emerald-600" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Show Testimonials Section</p>
            <p className="text-xs text-gray-500">
              {enabled
                ? "Visible on the homepage (also hidden automatically when no testimonials exist)."
                : "Hidden from the homepage — even if testimonials exist."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          role="switch"
          aria-checked={enabled}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            enabled ? "bg-emerald-500 focus:ring-emerald-500" : "bg-gray-300 focus:ring-gray-400"
          } ${toggling ? "opacity-60" : ""}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <CrudPage
        title="Testimonials"
        apiPath="testimonials"
        fields={[
          { key: "name", label: "Name", required: true },
          { key: "role", label: "Role" },
          { key: "country", label: "Country" },
          { key: "flag", label: "Flag Emoji" },
          { key: "quote", label: "Quote", type: "textarea", required: true },
          { key: "avatar", label: "Avatar", type: "image" },
          { key: "rating", label: "Rating", type: "number" },
        ]}
      />
    </div>
  );
}
