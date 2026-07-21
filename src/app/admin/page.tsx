"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Car, MessageSquareQuote, Star, HelpCircle, Users, Tag, Images, ListChecks, FileText, Cloud, Database, Trash2, HardDrive, AlertTriangle } from "lucide-react";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface Stats {
  vehicles: number;
  quotes: number;
  testimonials: number;
  faqs: number;
  users: number;
  brands: number;
  gallery: number;
  features: number;
  processSteps: number;
}

interface PurgeStats {
  softDeleted: { quotes: number; users: number; total: number };
  database: { tables: number; totalRecords: number; connection: boolean };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    vehicles: 0, quotes: 0, testimonials: 0, faqs: 0, users: 0,
    brands: 0, gallery: 0, features: 0, processSteps: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [purgeStats, setPurgeStats] = useState<PurgeStats | null>(null);
  const [purging, setPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const cloudinaryConfigured = isCloudinaryConfigured();
  const supabaseConfigured = isSupabaseConfigured();

  const fetchPurgeStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/purge");
      if (r.ok) setPurgeStats(await r.json());
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles").then((r) => r.json()).catch(() => []),
      fetch("/api/quotes").then((r) => r.json()).catch(() => []),
      fetch("/api/testimonials").then((r) => r.json()).catch(() => []),
      fetch("/api/faqs").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/users").then((r) => r.json()).catch(() => []),
      fetch("/api/brands?all=1").then((r) => r.json()).catch(() => []),
      fetch("/api/gallery?all=1").then((r) => r.json()).catch(() => []),
      fetch("/api/features").then((r) => r.json()).catch(() => []),
      fetch("/api/process-steps").then((r) => r.json()).catch(() => []),
    ]).then(([vehicles, quotes, testimonials, faqs, users, brands, gallery, features, processSteps]) => {
      setStats({
        vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        quotes: Array.isArray(quotes) ? quotes.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        faqs: Array.isArray(faqs) ? faqs.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        brands: Array.isArray(brands) ? brands.length : 0,
        gallery: Array.isArray(gallery) ? gallery.length : 0,
        features: Array.isArray(features) ? features.length : 0,
        processSteps: Array.isArray(processSteps) ? processSteps.length : 0,
      });
      if (Array.isArray(quotes)) {
        setRecentQuotes(quotes.slice(-5).reverse());
      }
      setLoading(false);
    });
    fetchPurgeStats();
  }, [fetchPurgeStats]);

  const handlePurge = async () => {
    setPurging(true);
    try {
      await fetch("/api/admin/purge", { method: "POST" });
      await fetchPurgeStats();
      setShowPurgeConfirm(false);
    } finally {
      setPurging(false);
    }
  };

  const cards = [
    { label: "Vehicles", value: stats.vehicles, icon: Car, href: "/admin/vehicles", color: "bg-blue-500" },
    { label: "Brands", value: stats.brands, icon: Tag, href: "/admin/brands", color: "bg-purple-500" },
    { label: "Gallery", value: stats.gallery, icon: Images, href: "/admin/gallery", color: "bg-pink-500" },
    { label: "Quotes", value: stats.quotes, icon: MessageSquareQuote, href: "/admin/quotes", color: "bg-green-500" },
    { label: "Users", value: stats.users, icon: Users, href: "/admin/users", color: "bg-indigo-500" },
    { label: "Testimonials", value: stats.testimonials, icon: Star, href: "/admin/testimonials", color: "bg-yellow-500" },
    { label: "FAQs", value: stats.faqs, icon: HelpCircle, href: "/admin/faqs", color: "bg-orange-500" },
    { label: "Features", value: stats.features, icon: ListChecks, href: "/admin/features", color: "bg-teal-500" },
    { label: "Process Steps", value: stats.processSteps, icon: FileText, href: "/admin/process-steps", color: "bg-cyan-500" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {/* Service status pills */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            supabaseConfigured
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <Database className="h-3.5 w-3.5" />
            {supabaseConfigured ? "Supabase connected" : "Supabase not configured"}
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            cloudinaryConfigured
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            <Cloud className="h-3.5 w-3.5" />
            {cloudinaryConfigured ? "Cloudinary connected" : "Cloudinary not configured"}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-200 transition-shadow hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} text-white shrink-0`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-gray-900">
                {loading ? "—" : card.value}
              </p>
              <p className="truncate text-xs text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Soft-delete purge + database info */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {/* Purge soft-deleted data */}
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">Soft-Deleted Data</h2>
          </div>
          {purgeStats ? (
            <>
              <div className="flex items-baseline gap-4 mb-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{purgeStats.softDeleted.total}</p>
                  <p className="text-[11px] text-gray-500">items pending purge</p>
                </div>
                <div className="text-[11px] text-gray-500">
                  {purgeStats.softDeleted.quotes} quotes, {purgeStats.softDeleted.users} users
                </div>
              </div>
              <button
                type="button"
                onClick={() => purgeStats.softDeleted.total > 0 && setShowPurgeConfirm(true)}
                disabled={purgeStats.softDeleted.total === 0}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-100 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {purgeStats.softDeleted.total === 0 ? "No data to purge" : "Purge All Soft-Deleted Data"}
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-400">Loading...</p>
          )}
        </div>

        {/* Database info */}
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-bold text-gray-900">Database</h2>
          </div>
          {purgeStats?.database ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Provider</span>
                <span className="text-xs font-medium text-gray-900">Supabase (PostgreSQL)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Tables</span>
                <span className="text-xs font-medium text-gray-900">{purgeStats.database.tables}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Records</span>
                <span className="text-xs font-medium text-gray-900">{purgeStats.database.totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`text-xs font-medium ${purgeStats.database.connection ? "text-green-600" : "text-red-600"}`}>
                  {purgeStats.database.connection ? "Connected" : "Not connected"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Loading...</p>
          )}
        </div>
      </div>

      {/* Purge confirmation modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !purging && setShowPurgeConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-red-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Purge All Soft-Deleted Data?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              This will permanently delete <strong>{purgeStats?.softDeleted.total}</strong> soft-deleted items
              ({purgeStats?.softDeleted.quotes} quotes, {purgeStats?.softDeleted.users} users).
            </p>
            <p className="text-xs text-red-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                disabled={purging}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurge}
                disabled={purging}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {purging ? "Purging..." : "Purge All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent quotes */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
          <Link href="/admin/quotes" className="text-sm font-medium text-brand-500 hover:text-brand-600">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentQuotes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">No quotes yet</p>
          ) : (
            recentQuotes.map((q) => (
              <div key={q.id as string} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{q.name as string}</p>
                  <p className="truncate text-xs text-gray-500">{q.email as string} • {q.vehicleBrand as string} {q.model as string}</p>
                </div>
                <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  q.status === "new" ? "bg-blue-100 text-blue-700" :
                  q.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {q.status as string}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
