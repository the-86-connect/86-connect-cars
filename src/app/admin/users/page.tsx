"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon, Mail, Phone, Globe, MessageSquareQuote, Plus, Trash2, X, Database } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface UserRow {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  country?: string;
  createdAt: string;
  quoteCount: number;
  favoriteCount: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteMode, setDeleteMode] = useState<"data" | "user" | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setWhatsapp("");
    setCountry("");
    setFormError("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    setFormError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        whatsapp: whatsapp.trim() || undefined,
        country: country.trim() || undefined,
      }),
    });

    if (res.status === 409) {
      setFormError("Email already registered.");
      setSaving(false);
      return;
    }
    if (!res.ok) {
      setFormError("Failed to create user.");
      setSaving(false);
      return;
    }

    await fetchUsers();
    resetForm();
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !deleteMode) return;
    const url =
      deleteMode === "data"
        ? `/api/admin/users/${deleteTarget.id}?dataOnly=1`
        : `/api/admin/users/${deleteTarget.id}`;
    await fetch(url, { method: "DELETE" });

    if (deleteMode === "user") {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } else {
      // data-only: keep user, zero out the counts
      setUsers((prev) =>
        prev.map((u) =>
          u.id === deleteTarget.id ? { ...u, quoteCount: 0, favoriteCount: 0 } : u
        )
      );
    }
    setDeleteTarget(null);
    setDeleteMode(null);
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q)
    );
  });

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {users.length} registered
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Add user form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Create New User</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="john@example.com" />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelClass}>WhatsApp <span className="text-xs font-normal text-gray-400">(optional)</span></label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} placeholder="+1234567890" />
            </div>
            <div>
              <label className={labelClass}>Country <span className="text-xs font-normal text-gray-400">(optional)</span></label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} placeholder="Nigeria" />
            </div>
          </div>
          {formError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or country..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <UsersIcon className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            {users.length === 0 ? "No registered users yet. Click \"Add User\" to create one." : "No users match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Name</th>
                <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Contact</th>
                <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Country</th>
                <th className="px-5 py-2.5 text-center font-semibold text-gray-600">Activity</th>
                <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Joined</th>
                <th className="px-5 py-2.5 text-right font-semibold text-gray-600">
                  <span title="Delete data only • Delete user">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-600">
                        {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {u.email}
                      </span>
                      {u.whatsapp && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {u.whatsapp}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {u.country ? (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {u.country}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <MessageSquareQuote className="h-3 w-3" /> {u.quoteCount}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        ★ {u.favoriteCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(u); setDeleteMode("data"); }}
                        disabled={u.quoteCount === 0 && u.favoriteCount === 0}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        title="Delete user's data only (keep account)"
                      >
                        <Database className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(u); setDeleteMode("user"); }}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete user and all their data"
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
        title={deleteMode === "data" ? "Delete User Data" : "Delete User"}
        message={
          deleteTarget
            ? deleteMode === "data"
              ? `Delete all data for "${deleteTarget.name}" (${deleteTarget.email})? This removes ${deleteTarget.quoteCount} quote(s) and ${deleteTarget.favoriteCount} favorite(s). The user account is kept. This cannot be undone.`
              : `Delete user "${deleteTarget.name}" (${deleteTarget.email}) and ALL their data (${deleteTarget.quoteCount} quote(s), ${deleteTarget.favoriteCount} favorite(s))? This cannot be undone.`
            : ""
        }
        confirmLabel={deleteMode === "data" ? "Delete Data" : "Delete User"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteMode(null); }}
      />
    </div>
  );
}
