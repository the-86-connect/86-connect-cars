"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { CloudinaryUpload } from "./CloudinaryUpload";

interface GalleryItem {
  id: string;
  type: "photo" | "video";
  src: string;
  thumbnail?: string;
  title: string;
  sortOrder: number;
  active: number;
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const [type, setType] = useState<"photo" | "video">("photo");
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/gallery?all=1");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => {
    setType("photo");
    setTitle("");
    setSrc("");
    setSortOrder(0);
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (item: GalleryItem) => {
    setEditing(item.id);
    setType(item.type);
    setTitle(item.title);
    setSrc(item.src);
    setSortOrder(item.sortOrder);
    setShowForm(true);
  };

  const handleSave = async () => {
    const id = editing || `gallery-${Date.now()}`;
    const method = editing ? "PUT" : "POST";
    const body = { id, type, src, title, sortOrder: Number(sortOrder) || 0 };

    await fetch("/api/gallery", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    await fetchItems();
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/gallery/${deleteTarget.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditing(null); setType("photo"); setTitle(""); setSrc(""); setSortOrder(0); }}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Gallery Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{editing ? "Edit" : "Add"} Gallery Item</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Type selector */}
            <div>
              <label className={labelClass}>Type *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setType("photo"); setSrc(""); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    type === "photo" ? "border-brand-500 bg-brand-50 text-brand-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" /> Photo
                </button>
                <button
                  type="button"
                  onClick={() => { setType("video"); setSrc(""); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    type === "video" ? "border-brand-500 bg-brand-50 text-brand-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <VideoIcon className="h-4 w-4" /> Video
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Sort Order (lower = first)</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required placeholder="e.g. BYD Han on the road" />
            </div>

            {/* Conditional src field */}
            <div className="sm:col-span-2">
              {type === "video" ? (
                <div>
                  <label className={labelClass}>YouTube URL or Video ID *</label>
                  <input
                    type="text"
                    value={src}
                    onChange={(e) => setSrc(e.target.value)}
                    className={inputClass}
                    placeholder="https://youtu.be/dQw4w9WgXcQ  or  dQw4w9WgXcQ"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Accepts full YouTube URLs, share links, embed URLs, or raw 11-char video IDs.</p>
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Photo *</label>
                  <CloudinaryUpload
                    value={src}
                    onChange={(url) => setSrc(url)}
                    alt={title || "Gallery photo"}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="button" onClick={handleSave} disabled={!src || !title} className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
              <Check className="h-4 w-4" /> Save
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items yet. Click "Add Gallery Item" to create one.</p>
      ) : (
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Preview</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-gray-100">
                      {item.type === "photo" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnail || item.src} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-900 max-w-[280px] truncate">{item.title}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      item.type === "video" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: item.id, label: item.title })}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Gallery Item"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.label}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
