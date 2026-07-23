"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Car, MessageSquareQuote, Star, HelpCircle, Users, Tag, Images, ListChecks, FileText, Cloud, Database, Trash2, HardDrive, AlertTriangle, TrendingUp } from "lucide-react";
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

// ── Donut chart (pure SVG, no dependency) ──
function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {total > 0 && segments.map((seg) => {
          if (seg.value === 0) return null;
          const dash = (seg.value / total) * circumference;
          const circle = (
            <circle
              key={seg.label}
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
        <text x="70" y="65" textAnchor="middle" className="fill-gray-900 text-2xl font-bold">{total}</text>
        <text x="70" y="82" textAnchor="middle" className="fill-gray-400 text-[10px] font-medium">Total</text>
      </svg>
      <div className="flex-1 space-y-1.5">
        {segments.filter((s) => s.value > 0).map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="flex-1 truncate text-gray-600">{seg.label}</span>
            <span className="font-semibold text-gray-900">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal bar chart (pure CSS) ──
function BarChart({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-gray-500">{item.label}</span>
          <div className="flex-1 h-5 rounded-md bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    vehicles: 0, quotes: 0, testimonials: 0, faqs: 0, users: 0,
    brands: 0, gallery: 0, features: 0, processSteps: 0,
  });
  const [allQuotes, setAllQuotes] = useState<Record<string, unknown>[]>([]);
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
      if (Array.isArray(quotes)) setAllQuotes(quotes);
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

  // Compact stat cards
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

  // Donut chart data — content distribution
  const donutSegments = useMemo(() => [
    { label: "Vehicles", value: stats.vehicles, color: "#3b82f6" },
    { label: "Brands", value: stats.brands, color: "#a855f7" },
    { label: "Gallery", value: stats.gallery, color: "#ec4899" },
    { label: "Quotes", value: stats.quotes, color: "#22c55e" },
    { label: "Users", value: stats.users, color: "#6366f1" },
    { label: "Testimonials", value: stats.testimonials, color: "#eab308" },
    { label: "FAQs", value: stats.faqs, color: "#f97316" },
    { label: "Features", value: stats.features, color: "#14b8a6" },
    { label: "Process Steps", value: stats.processSteps, color: "#06b6d4" },
  ], [stats]);
  const donutTotal = donutSegments.reduce((a, b) => a + b.value, 0);

  // Quote status breakdown (bar chart)
  const quoteStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuotes.forEach((q) => {
      const s = String(q.status ?? "new");
      counts[s] = (counts[s] ?? 0) + 1;
    });
    const colors: Record<string, string> = { new: "#3b82f6", contacted: "#eab308", closed: "#22c55e", won: "#22c55e", lost: "#ef4444" };
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value, color: colors[label] ?? "#9ca3af" }));
  }, [allQuotes]);

  // Delivery status breakdown (progress bars)
  const deliveryStatusData = useMemo(() => {
    const steps = [
      { key: "pending", label: "Pending" },
      { key: "booking_confirmed", label: "Booking Confirmed" },
      { key: "loading", label: "Loading" },
      { key: "in_transit", label: "In Transit" },
      { key: "at_destination_port", label: "At Destination" },
      { key: "customs_clearance", label: "Customs" },
      { key: "delivered", label: "Delivered" },
    ];
    const counts: Record<string, number> = {};
    allQuotes.forEach((q) => {
      const s = String(q.deliveryStatus ?? "pending");
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return steps.map((s) => ({ ...s, count: counts[s.key] ?? 0 }));
  }, [allQuotes]);

  const recentQuotes = allQuotes.slice(-5).reverse();

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

      {/* Stats cards — compact per user pref */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-2.5 rounded-lg bg-white p-3 shadow-sm border border-gray-200 transition-shadow hover:shadow-md"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.color} text-white shrink-0`}>
              <card.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {loading ? "—" : card.value}
              </p>
              <p className="truncate text-[11px] text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Content Distribution Donut */}
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-bold text-gray-900">Content Distribution</h2>
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 py-8 text-center">Loading...</p>
          ) : donutTotal === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <DonutChart segments={donutSegments} total={donutTotal} />
          )}
        </div>

        {/* Quote Status Breakdown */}
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareQuote className="h-4 w-4 text-green-500" />
            <h2 className="text-sm font-bold text-gray-900">Quote Status Breakdown</h2>
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 py-8 text-center">Loading...</p>
          ) : quoteStatusData.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">No quotes yet</p>
          ) : (
            <BarChart items={quoteStatusData} />
          )}
        </div>
      </div>

      {/* Delivery tracking + Database info */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Delivery Status Progress */}
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900">Delivery Tracking</h2>
            <span className="ml-auto text-[11px] text-gray-400">{allQuotes.length} total quotes</span>
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 py-4 text-center">Loading...</p>
          ) : allQuotes.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No quotes to track</p>
          ) : (
            <div className="space-y-2">
              {deliveryStatusData.map((step) => {
                const pct = allQuotes.length > 0 ? (step.count / allQuotes.length) * 100 : 0;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-[11px] text-gray-500">{step.label}</span>
                    <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-[11px] font-semibold text-gray-900">{step.count}</span>
                  </div>
                );
              })}
            </div>
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

      {/* Soft-delete purge */}
      <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm mb-6">
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
