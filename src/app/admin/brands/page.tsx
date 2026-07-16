"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";

interface BrandRow {
  id: string;
  name: string;
  logo: string;
  category: "chinese" | "foreign" | "trucks";
  sortOrder: number;
  active: number;
}

const CATEGORIES = ["chinese", "foreign", "trucks"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  chinese: "Chinese",
  foreign: "Foreign",
  trucks: "Trucks",
};

function resolveLogo(logo: string): string {
  if (logo.startsWith("http")) return logo;
  return `/brands/${logo}`;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandRow | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [category, setCategory] = useState<string>("foreign");
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    fetch("/api/brands?all=1")
      .then((r) => r.json())
      .then((data) => {
        setBrands(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const resetForm = () => {
    setName("");
    setLogo("");
    setCategory("foreign");
    setSortOrder(0);
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !logo.trim()) return;

    if (editing) {
      await fetch(`/api/brands/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo, category, sortOrder }),
      });
    } else {
      await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo, category, sortOrder }),
      });
    }

    // Refresh list
    const res = await fetch("/api/brands?all=1");
    const data = await res.json();
    setBrands(Array.isArray(data) ? data : []);
    resetForm();
  };

  const handleEdit = (brand: BrandRow) => {
    setEditing(brand);
    setName(brand.name);
    setLogo(brand.logo);
    setCategory(brand.category);
    setSortOrder(brand.sortOrder);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/brands/${deleteTarget.id}`, { method: "DELETE" });
    setBrands((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            {editing ? `Edit ${editing.name}` : "Add New Brand"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Brand Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. BYD" />
            </div>
            <div>
              <label className={labelClass}>Logo *</label>
              <CloudinaryUpload
                value={logo}
                onChange={(url) => setLogo(url)}
                alt={`${name || "Brand"} logo`}
              />
              <p className="mt-1 text-xs text-gray-500">Upload via Cloudinary, paste a URL, or use a local filename in /public/brands/.</p>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sort Order (lower = first)</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleSave} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              {editing ? "Update Brand" : "Create Brand"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((cat) => {
            const catBrands = brands.filter((b) => b.category === cat);
            if (catBrands.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {CATEGORY_LABELS[cat]} ({catBrands.length})
                </h2>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Logo</th>
                        <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Name</th>
                        <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Sort</th>
                        <th className="px-5 py-2.5 text-right font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {catBrands.map((brand) => (
                        <tr key={brand.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <div className="relative h-8 w-12">
                              <img
                                src={resolveLogo(brand.logo)}
                                alt={brand.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-900">{brand.name}</td>
                          <td className="px-5 py-3 text-gray-500">{brand.sortOrder}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(brand)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(brand)}
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
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Brand"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
