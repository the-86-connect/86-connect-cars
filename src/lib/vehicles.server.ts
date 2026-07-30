/**
 * Server-only vehicle accessors — reads from SQLite via lib/db.
 * Used by server components (pages) so public pages reflect admin edits in real time.
 *
 * Client components receive vehicles as props from their parent server page,
 * OR fetch from /api/vehicles for live updates.
 */
import "server-only";
import { vehicles as vehicleTable } from "@/lib/db";
import { vehicles as mockVehicles } from "@/lib/data";
import type { Vehicle } from "@/types";

function parseVehicle(v: Record<string, unknown>): Vehicle {
  const parse = (val: unknown, fallback: unknown) =>
    typeof val === "string" ? JSON.parse(val) : val ?? fallback;

  const mainImage = (v.image as string) || "";
  const galleryImages = parse(v.images, []) as string[];
  const images =
    galleryImages.length > 0
      ? galleryImages
      : mainImage
        ? [mainImage]
        : [];

  return {
    ...v,
    image: mainImage || images[0] || "",
    images,
    specs: parse(v.specs, {}),
    features: parse(v.features, []),
    colors: parse(v.colors, []),
    exportDocs: parse(v.exportDocs, []),
    video: (v.video as string) || undefined,
  } as Vehicle;
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const rows = await vehicleTable.list();
    const dbVehicles = rows.map(parseVehicle);
    // Fallback to mock data when DB is empty (dev without Supabase)
    return dbVehicles.length > 0 ? dbVehicles : mockVehicles;
  } catch (error) {
    console.error("getVehicles error:", error);
    return mockVehicles;
  }
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  try {
    const v = await vehicleTable.findBySlug(slug);
    return v ? parseVehicle(v as Record<string, unknown>) : null;
  } catch (error) {
    console.error("getVehicleBySlug error:", error);
    return null;
  }
}

export async function getFeaturedVehicles(limit = 8): Promise<Vehicle[]> {
  const all = await getVehicles();
  return all.slice(0, limit);
}

/**
 * Score-based similar vehicles recommender.
 * Weighs shared attributes: brand (3), bodyType (2), fuel (1), transmission (1),
 * and price proximity within 30% (1). Falls back to newest vehicles if too few scored matches.
 */
export async function getSimilarVehicles(
  vehicle: Vehicle,
  limit = 4,
): Promise<Vehicle[]> {
  const all = await getVehicles();
  const scored = all
    .filter((v) => v.id !== vehicle.id)
    .map((v) => {
      let score = 0;
      if (v.brand === vehicle.brand) score += 3;
      if (v.bodyType === vehicle.bodyType) score += 2;
      if (v.fuel === vehicle.fuel) score += 1;
      if (v.transmission === vehicle.transmission) score += 1;
      // ponytail: price-proximity guard — avoids div-by-zero on free/placeholder entries
      if (vehicle.price > 0) {
        const diff = Math.abs(v.price - vehicle.price) / vehicle.price;
        if (diff <= 0.3) score += 1;
      }
      return { v, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.v);

  // Fill remaining slots with newest vehicles when matches are sparse
  if (scored.length < limit) {
    const seen = new Set(scored.map((v) => v.id));
    const fill = all
      .filter((v) => v.id !== vehicle.id && !seen.has(v.id))
      .slice(0, limit - scored.length);
    return [...scored, ...fill];
  }
  return scored;
}
