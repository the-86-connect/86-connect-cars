"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Drivetrain } from "@/types";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";

interface VehicleSpecs {
  power?: string;
  torque?: string;
  acceleration?: string;
  topSpeed?: string;
  range?: string;
  fuelEconomy?: string;
  batteryCapacity?: string;
  chargingTime?: string;
  engineDisplacement?: string;
  drivetrain?: Drivetrain | "";
  length?: string;
  width?: string;
  height?: string;
  wheelbase?: string;
  weight?: string;
  seatingCapacity?: number | "";
  bootSpace?: string;
  payloadCapacity?: string;
  cargoVolume?: string;
}

interface VehicleData {
  id?: string;
  slug?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  bodyType: string;
  transmission: string;
  condition: string;
  availability: string;
  image: string;
  images?: string[];
  video?: string;
  badge: string;
  engine: string;
  range?: string;
  mileage?: number | "";
  description: string;
  features: string[];
  colors: string[];
  specs?: VehicleSpecs;
  exportDocs?: string[];
  fobPrice: number;
  portOfLoading: string;
  handDrive: string;
  shippingEstimate: string;
}

function parseSpecs(raw: unknown): VehicleSpecs {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, unknown>;
  return {
    power: s.power as string | undefined,
    torque: s.torque as string | undefined,
    acceleration: s.acceleration as string | undefined,
    topSpeed: s.topSpeed as string | undefined,
    range: s.range as string | undefined,
    fuelEconomy: s.fuelEconomy as string | undefined,
    batteryCapacity: s.batteryCapacity as string | undefined,
    chargingTime: s.chargingTime as string | undefined,
    engineDisplacement: s.engineDisplacement as string | undefined,
    drivetrain: s.drivetrain as Drivetrain | undefined,
    length: s.length as string | undefined,
    width: s.width as string | undefined,
    height: s.height as string | undefined,
    wheelbase: s.wheelbase as string | undefined,
    weight: s.weight as string | undefined,
    seatingCapacity: typeof s.seatingCapacity === "number" ? s.seatingCapacity : undefined,
    bootSpace: s.bootSpace as string | undefined,
    payloadCapacity: s.payloadCapacity as string | undefined,
    cargoVolume: s.cargoVolume as string | undefined,
  };
}

export function VehicleForm({ initialData }: { initialData?: Partial<VehicleData> }) {
  const router = useRouter();

  const initSpecs = parseSpecs(initialData?.specs);
  const initImages = initialData?.images ?? [];
  const initExportDocs = initialData?.exportDocs ?? [];

  const defaults: VehicleData = {
    brand: "", model: "", year: new Date().getFullYear(), price: 0,
    fuel: "Petrol", bodyType: "SUV", transmission: "Automatic",
    condition: "New", availability: "In Stock", image: "", badge: "",
    engine: "", description: "", features: [], colors: [], fobPrice: 0,
    portOfLoading: "", handDrive: "LHD", shippingEstimate: "",
  };
  const [form, setForm] = useState<VehicleData>({ ...defaults, ...initialData });
  const [specs, setSpecs] = useState<VehicleSpecs>(initSpecs);
  const [featuresText, setFeaturesText] = useState((initialData?.features || []).join("\n"));
  const [colorsText, setColorsText] = useState((initialData?.colors || []).join(", "));
  const [imagesText, setImagesText] = useState(initImages.join("\n"));
  const [exportDocsText, setExportDocsText] = useState(initExportDocs.join("\n"));
  const [range, setRange] = useState(initialData?.range ?? "");
  const [mileage, setMileage] = useState<number | "">(initialData?.mileage ?? "");
  const [saving, setSaving] = useState(false);
  const [brandNames, setBrandNames] = useState<string[]>([]);

  // Fetch brand names from API (admin-managed, includes admin-added brands)
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrandNames(data.map((b: { name: string }) => b.name));
        }
      })
      .catch((err) => console.error("Brand fetch error:", err));
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecChange = (field: keyof VehicleSpecs, value: string | number) => {
    setSpecs((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Build specs object — only include non-empty fields
    const cleanSpecs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(specs)) {
      if (v !== undefined && v !== "") cleanSpecs[k] = v;
    }

    const data = {
      ...form,
      slug: form.slug || form.model.toLowerCase().replace(/\s+/g, "-"),
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      features: featuresText.split("\n").filter(Boolean),
      colors: colorsText.split(",").map((c) => c.trim()).filter(Boolean),
      exportDocs: exportDocsText.split("\n").map((s) => s.trim()).filter(Boolean),
      specs: cleanSpecs,
      range: range || undefined,
      mileage: mileage || undefined,
    };

    const url = form.id ? `/api/vehicles/${form.id}` : "/api/vehicles";
    const method = form.id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    router.push("/admin/vehicles");
    router.refresh();
  };

  const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass = "rounded-xl border border-gray-200 bg-gray-50/50 p-5";
  const summaryClass = "cursor-pointer text-sm font-semibold text-gray-800 select-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Section A — Basic Info */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Brand *</label>
            <select value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} className={inputClass} required>
              <option value="">Select a brand...</option>
              {brandNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Model *</label>
            <input type="text" value={form.model} onChange={(e) => handleChange("model", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Year *</label>
            <input type="number" value={form.year} onChange={(e) => handleChange("year", Number(e.target.value))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Badge</label>
            <input type="text" value={form.badge} onChange={(e) => handleChange("badge", e.target.value)} className={inputClass} placeholder="e.g. Hot, New, Premium" />
          </div>
          <div>
            <label className={labelClass}>Fuel Type</label>
            <select value={form.fuel} onChange={(e) => handleChange("fuel", e.target.value)} className={inputClass}>
              {["Petrol", "Diesel", "Electric", "Hybrid"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Body Type</label>
            <select value={form.bodyType} onChange={(e) => handleChange("bodyType", e.target.value)} className={inputClass}>
              {["SUV", "Sedan", "Truck", "Coupe", "Hatchback", "Pickup", "Van", "Bus"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Transmission</label>
            <select value={form.transmission} onChange={(e) => handleChange("transmission", e.target.value)} className={inputClass}>
              {["Automatic", "Manual", "Single-Speed"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <select value={form.condition} onChange={(e) => handleChange("condition", e.target.value)} className={inputClass}>
              {["New", "Used", "Certified Pre-Owned"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Availability</label>
            <select value={form.availability} onChange={(e) => handleChange("availability", e.target.value)} className={inputClass}>
              {["In Stock", "On Request", "Sold"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section B — Pricing */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Pricing</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Price (USD) *</label>
            <input type="number" value={form.price} onChange={(e) => handleChange("price", Number(e.target.value))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>FOB Price (USD)</label>
            <input type="number" value={form.fobPrice || ""} onChange={(e) => handleChange("fobPrice", Number(e.target.value))} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Section C — Images & Video */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Images &amp; Video</h3>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Main Image *</label>
            <CloudinaryUpload
              value={form.image}
              onChange={(url) => handleChange("image", url)}
              alt={`${form.brand || "Vehicle"} main image`}
            />
            <p className="mt-1 text-xs text-gray-500">Upload via Cloudinary, paste a URL, or use a local path like /vehicles/image.jpg.</p>
          </div>

          <div>
            <label className={labelClass}>Gallery Images (max 6)</label>
            <MultiImageUpload
              value={form.images ?? []}
              onChange={(urls) => {
                setImagesText(urls.join("\n"));
                setForm((prev) => ({ ...prev, images: urls }));
              }}
              max={6}
              alt={`${form.brand || "Vehicle"} gallery`}
            />
          </div>

          <div>
            <label className={labelClass}>YouTube Video URL (optional)</label>
            <input
              type="text"
              value={form.video ?? ""}
              onChange={(e) => handleChange("video", e.target.value)}
              className={inputClass}
              placeholder="https://youtu.be/dQw4w9WgXcQ  or  dQw4w9WgXcQ"
            />
            <p className="mt-1 text-xs text-gray-500">Accepts full YouTube URLs, share links, embed URLs, or raw 11-char video IDs. Rendered as an embedded player on the detail page.</p>
          </div>
        </div>
      </div>

      {/* Section D — Performance & Specs (collapsible) */}
      <details className={sectionClass}>
        <summary className={summaryClass}>Performance &amp; Specs (optional)</summary>
        <div className="mt-4 space-y-6">
          {/* Quick performance fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Range (EV)</label>
              <input type="text" value={range} onChange={(e) => setRange(e.target.value)} className={inputClass} placeholder="e.g. 600 km" />
            </div>
            <div>
              <label className={labelClass}>Mileage (km, for used vehicles)</label>
              <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value ? Number(e.target.value) : "")} className={inputClass} placeholder="e.g. 15000" />
            </div>
            <div>
              <label className={labelClass}>Engine</label>
              <input type="text" value={form.engine} onChange={(e) => handleChange("engine", e.target.value)} className={inputClass} placeholder="e.g. 2.0L Turbo" />
            </div>
          </div>

          {/* Performance specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Performance</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Power</label>
                <input type="text" value={specs.power ?? ""} onChange={(e) => handleSpecChange("power", e.target.value)} className={inputClass} placeholder="e.g. 200 hp" />
              </div>
              <div>
                <label className={labelClass}>Torque</label>
                <input type="text" value={specs.torque ?? ""} onChange={(e) => handleSpecChange("torque", e.target.value)} className={inputClass} placeholder="e.g. 350 Nm" />
              </div>
              <div>
                <label className={labelClass}>Acceleration (0-100 km/h)</label>
                <input type="text" value={specs.acceleration ?? ""} onChange={(e) => handleSpecChange("acceleration", e.target.value)} className={inputClass} placeholder="e.g. 6.5s" />
              </div>
              <div>
                <label className={labelClass}>Top Speed</label>
                <input type="text" value={specs.topSpeed ?? ""} onChange={(e) => handleSpecChange("topSpeed", e.target.value)} className={inputClass} placeholder="e.g. 200 km/h" />
              </div>
            </div>
          </div>

          {/* EV / Fuel specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">EV / Fuel</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Battery Capacity</label>
                <input type="text" value={specs.batteryCapacity ?? ""} onChange={(e) => handleSpecChange("batteryCapacity", e.target.value)} className={inputClass} placeholder="e.g. 75 kWh" />
              </div>
              <div>
                <label className={labelClass}>Charging Time</label>
                <input type="text" value={specs.chargingTime ?? ""} onChange={(e) => handleSpecChange("chargingTime", e.target.value)} className={inputClass} placeholder="e.g. 8h (AC)" />
              </div>
              <div>
                <label className={labelClass}>Fuel Economy</label>
                <input type="text" value={specs.fuelEconomy ?? ""} onChange={(e) => handleSpecChange("fuelEconomy", e.target.value)} className={inputClass} placeholder="e.g. 6.5 L/100km" />
              </div>
              <div>
                <label className={labelClass}>Engine Displacement</label>
                <input type="text" value={specs.engineDisplacement ?? ""} onChange={(e) => handleSpecChange("engineDisplacement", e.target.value)} className={inputClass} placeholder="e.g. 2.0L" />
              </div>
            </div>
          </div>

          {/* Drivetrain */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Drivetrain</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Drivetrain</label>
                <select value={specs.drivetrain ?? ""} onChange={(e) => handleSpecChange("drivetrain", e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {["FWD", "RWD", "AWD", "4x4", "4x2"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Dimensions</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Length</label>
                <input type="text" value={specs.length ?? ""} onChange={(e) => handleSpecChange("length", e.target.value)} className={inputClass} placeholder="e.g. 4980 mm" />
              </div>
              <div>
                <label className={labelClass}>Width</label>
                <input type="text" value={specs.width ?? ""} onChange={(e) => handleSpecChange("width", e.target.value)} className={inputClass} placeholder="e.g. 1890 mm" />
              </div>
              <div>
                <label className={labelClass}>Height</label>
                <input type="text" value={specs.height ?? ""} onChange={(e) => handleSpecChange("height", e.target.value)} className={inputClass} placeholder="e.g. 1490 mm" />
              </div>
              <div>
                <label className={labelClass}>Wheelbase</label>
                <input type="text" value={specs.wheelbase ?? ""} onChange={(e) => handleSpecChange("wheelbase", e.target.value)} className={inputClass} placeholder="e.g. 2920 mm" />
              </div>
              <div>
                <label className={labelClass}>Weight</label>
                <input type="text" value={specs.weight ?? ""} onChange={(e) => handleSpecChange("weight", e.target.value)} className={inputClass} placeholder="e.g. 1850 kg" />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Capacity</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Seating Capacity</label>
                <input type="number" value={specs.seatingCapacity ?? ""} onChange={(e) => handleSpecChange("seatingCapacity", e.target.value ? Number(e.target.value) : "")} className={inputClass} placeholder="e.g. 5" />
              </div>
              <div>
                <label className={labelClass}>Boot Space</label>
                <input type="text" value={specs.bootSpace ?? ""} onChange={(e) => handleSpecChange("bootSpace", e.target.value)} className={inputClass} placeholder="e.g. 500 L" />
              </div>
              <div>
                <label className={labelClass}>Payload Capacity</label>
                <input type="text" value={specs.payloadCapacity ?? ""} onChange={(e) => handleSpecChange("payloadCapacity", e.target.value)} className={inputClass} placeholder="e.g. 1000 kg" />
              </div>
              <div>
                <label className={labelClass}>Cargo Volume</label>
                <input type="text" value={specs.cargoVolume ?? ""} onChange={(e) => handleSpecChange("cargoVolume", e.target.value)} className={inputClass} placeholder="e.g. 1500 L" />
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* Section E — Export Info (collapsible) */}
      <details className={sectionClass}>
        <summary className={summaryClass}>Export &amp; Shipping Info (optional)</summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Port of Loading</label>
              <input type="text" value={form.portOfLoading} onChange={(e) => handleChange("portOfLoading", e.target.value)} className={inputClass} placeholder="e.g. Shanghai, Tianjin" />
            </div>
            <div>
              <label className={labelClass}>Hand Drive</label>
              <select value={form.handDrive} onChange={(e) => handleChange("handDrive", e.target.value)} className={inputClass}>
                {["LHD", "RHD"].map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Shipping Estimate</label>
              <input type="text" value={form.shippingEstimate} onChange={(e) => handleChange("shippingEstimate", e.target.value)} className={inputClass} placeholder="e.g. 40-60 days by sea" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Export Documents (one per line)</label>
            <textarea value={exportDocsText} onChange={(e) => setExportDocsText(e.target.value)} className={inputClass} rows={4} placeholder="Commercial Invoice&#10;Packing List&#10;Bill of Lading&#10;Certificate of Origin" />
          </div>
        </div>
      </details>

      {/* Section F — Description, Features & Colors */}
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Description, Features &amp; Colors</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className={inputClass} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Features (one per line)</label>
            <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className={inputClass} rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
          </div>
          <div>
            <label className={labelClass}>Colors (comma-separated)</label>
            <input type="text" value={colorsText} onChange={(e) => setColorsText(e.target.value)} className={inputClass} placeholder="White, Black, Blue" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {saving ? "Saving..." : initialData?.id ? "Update Vehicle" : "Create Vehicle"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
