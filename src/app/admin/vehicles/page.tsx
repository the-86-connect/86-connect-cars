"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ChevronDown, Car } from "lucide-react";
import type { BrandCategory } from "@/lib/brands";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface BrandInfo {
  id: string;
  name: string;
  logo: string;
  category: BrandCategory;
  sortOrder: number;
}

interface VehicleRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  availability: string;
  image?: string;
}

const CATEGORY_LABELS: Record<BrandCategory, string> = {
  chinese: "Chinese Brands",
  foreign: "Foreign Brands",
  trucks: "Truck Brands",
};

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [allBrands, setAllBrands] = useState<BrandInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleRow | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([vData, bData]) => {
      setVehicles(Array.isArray(vData) ? vData : []);
      setAllBrands(Array.isArray(bData) ? bData : []);
      setLoading(false);
    });
  }, []);

  // Group vehicles by brand
  const vehiclesByBrand = useMemo(() => {
    const map = new Map<string, VehicleRow[]>();
    for (const v of vehicles) {
      const arr = map.get(v.brand) ?? [];
      arr.push(v);
      map.set(v.brand, arr);
    }
    return map;
  }, [vehicles]);

  // Group brands by category
  const brandsByCategory = useMemo(() => {
    const map = new Map<BrandCategory, BrandInfo[]>();
    for (const b of allBrands) {
      const arr = map.get(b.category) ?? [];
      arr.push(b);
      map.set(b.category, arr);
    }
    return map;
  }, [allBrands]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/vehicles/${deleteTarget.id}`, { method: "DELETE" });
    setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <Link
          href="/admin/vehicles/new"
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-8">
          {(["chinese", "foreign", "trucks"] as BrandCategory[]).map((category) => {
            const brands = brandsByCategory.get(category) ?? [];
            if (brands.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {CATEGORY_LABELS[category]}
                </h2>
                <div className="space-y-2">
                  {brands.map((brand) => {
                    const brandVehicles = vehiclesByBrand.get(brand.name) ?? [];
                    const count = brandVehicles.length;
                    const isExpanded = expandedBrand === brand.name;

                    return (
                      <div
                        key={brand.name}
                        className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                          isExpanded ? "border-brand-300" : "border-gray-200"
                        }`}
                      >
                        {/* Brand header row */}
                        <div
                          className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
                          onClick={() => setExpandedBrand(isExpanded ? null : brand.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-8 w-12 shrink-0">
                              <Image
                                src={brand.logo.startsWith("http") ? brand.logo : `/brands/${brand.logo}`}
                                alt={brand.name}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">{brand.name}</h3>
                              <p className={`text-xs ${count > 0 ? "text-gray-500" : "text-gray-400"}`}>
                                {count} {count === 1 ? "vehicle" : "vehicles"} available
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/vehicles/new?brand=${encodeURIComponent(brand.name)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-500/20"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add {brand.name}
                            </Link>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded vehicle list */}
                        {isExpanded && (
                          <div className="border-t border-gray-100">
                            {count === 0 ? (
                              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
                                <Car className="h-4 w-4" />
                                No vehicles yet. Click "Add {brand.name}" to create the first one.
                              </div>
                            ) : (
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Vehicle</th>
                                    <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Price</th>
                                    <th className="px-5 py-2.5 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-5 py-2.5 text-right font-semibold text-gray-600">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {brandVehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                      <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                          {v.image && (
                                            <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
                                              <img
                                                src={v.image}
                                                alt={`${v.brand} ${v.model}`}
                                                className="h-full w-full object-cover"
                                              />
                                            </div>
                                          )}
                                          <div>
                                            <p className="font-medium text-gray-900">{v.model}</p>
                                            <p className="text-xs text-gray-500">{v.year} • {v.fuel}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-5 py-3 font-medium text-gray-900">
                                        ${v.price?.toLocaleString()}
                                      </td>
                                      <td className="px-5 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                          v.availability === "In Stock" ? "bg-green-100 text-green-700" :
                                          v.availability === "On Request" ? "bg-yellow-100 text-yellow-700" :
                                          "bg-gray-100 text-gray-700"
                                        }`}>
                                          {v.availability}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <Link
                                            href={`/admin/vehicles/${v.id}/edit`}
                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => setDeleteTarget(v)}
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
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Vehicle"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.brand} ${deleteTarget.model}? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
