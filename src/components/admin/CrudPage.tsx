"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { CloudinaryUpload } from "./CloudinaryUpload";

interface Field {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "image";
  options?: string[];
  required?: boolean;
}

export function CrudPage({
  title, apiPath, fields,
}: {
  title: string; apiPath: string; fields: Field[];
}) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    fetch(`/api/${apiPath}`)
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }, [apiPath]);

  const handleSave = async () => {
    const id = editing || `${apiPath}-${Date.now()}`;
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id, ...form } : form;

    await fetch(`/api/${apiPath}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Refresh list
    const res = await fetch(`/api/${apiPath}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setShowForm(false);
    setEditing(null);
    setForm({});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/${apiPath}/${deleteTarget.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const startEdit = (item: Record<string, unknown>) => {
    setEditing(item.id as string);
    const formData: Record<string, string> = {};
    fields.forEach((f) => { formData[f.key] = String(item[f.key] ?? ""); });
    setForm(formData);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditing(null); setForm({}); }}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add {title.replace(/s$/, "")}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{editing ? "Edit" : "Add"} {title.replace(/s$/, "")}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" || field.type === "image" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                {field.type === "image" ? (
                  <CloudinaryUpload
                    value={form[field.key] ?? ""}
                    onChange={(url) => setForm((prev) => ({ ...prev, [field.key]: url }))}
                    alt={field.label}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    rows={3}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              <Check className="h-4 w-4" /> Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items yet. Click &quot;Add&quot; to create one.</p>
      ) : (
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {fields.slice(0, 3).map((f) => (
                  <th key={f.key} className="px-5 py-3 text-left font-semibold text-gray-600">{f.label}</th>
                ))}
                <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id as string} className="hover:bg-gray-50">
                  {fields.slice(0, 3).map((f) => (
                    <td key={f.key} className="px-5 py-3 text-gray-900 max-w-[200px] truncate">
                      {String(item[f.key] ?? "")}
                    </td>
                  ))}
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
                        onClick={() => setDeleteTarget({
                          id: item.id as string,
                          label: String(item[fields[0]?.key] ?? item.id),
                        })}
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
        title={`Delete ${title.replace(/s$/, "")}`}
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
