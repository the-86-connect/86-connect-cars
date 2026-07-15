"use client";

import { useEffect, useState } from "react";

const QUOTE_STATUSES = ["new", "contacted", "closed"] as const;
const DELIVERY_STATUSES = ["pending", "received", "in_transit", "shipped", "delivered"] as const;

const DELIVERY_LABELS: Record<string, string> = {
  pending: "Pending",
  received: "Order Received",
  in_transit: "In Transit",
  shipped: "Shipped",
  delivered: "Delivered",
};

const DELIVERY_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  received: "bg-blue-100 text-blue-700",
  in_transit: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  closed: "bg-green-100 text-green-700",
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => { setQuotes(Array.isArray(data) ? data.reverse() : []); setLoading(false); });
  }, []);

  const updateField = async (id: string, field: string, value: string) => {
    await fetch("/api/quotes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quote Submissions</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : quotes.length === 0 ? (
        <p className="text-gray-500">No quotes yet.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const id = q.id as string;
            const isExpanded = expandedId === id;
            const deliveryStatus = (q.deliveryStatus as string) || "pending";
            return (
              <div key={id} className="rounded-xl bg-white border border-gray-200 shadow-sm">
                {/* Top row — always visible */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{q.name as string}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[q.status as string] || ""}`}>
                          {q.status as string}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DELIVERY_COLORS[deliveryStatus] || ""}`}>
                          {DELIVERY_LABELS[deliveryStatus] || deliveryStatus}
                        </span>
                        {q.userId ? (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            Registered
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                            Guest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {q.email as string} • {q.whatsapp as string} • {q.country as string}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Vehicle: <span className="font-medium text-gray-700">{String(q.vehicleBrand)} {String(q.model)}</span>
                        {q.budget ? <span> • Budget: {String(q.budget)}</span> : null}
                      </p>
                      {q.message ? (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-2">{String(q.message)}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {isExpanded ? "Hide" : "Manage"}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(q.createdAt as string).toLocaleString()}
                  </p>
                </div>

                {/* Expanded panel — quote status + delivery status controls */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Quote status */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Quote Status</label>
                        <div className="flex flex-wrap gap-1.5">
                          {QUOTE_STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateField(id, "status", s)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                q.status === s
                                  ? `${STATUS_COLORS[s]} ring-2 ring-offset-1`
                                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Delivery status */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Delivery Tracking</label>
                        <div className="flex flex-wrap gap-1.5">
                          {DELIVERY_STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateField(id, "deliveryStatus", s)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                deliveryStatus === s
                                  ? `${DELIVERY_COLORS[s]} ring-2 ring-offset-1`
                                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {DELIVERY_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
