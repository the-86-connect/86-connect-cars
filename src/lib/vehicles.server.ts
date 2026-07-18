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

  return {
    ...v,
    images: parse(v.images, []),
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
