/**
 * Server-only brand accessors — reads from Supabase PostgreSQL via lib/db.
 * Auto-seeds the brands table from the static BRAND_LIST on first call.
 * Admin can add/edit/delete brands via /admin/brands.
 */
import "server-only";
import { brands as brandTable } from "@/lib/db";
import { BRAND_LIST, type BrandCategory } from "@/lib/brands";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface BrandRow {
  id: string;
  name: string;
  logo: string; // raw: either local filename or full URL
  category: BrandCategory;
  sortOrder: number;
}

/** Resolve a logo value to a usable src: full URL as-is, local filename → /brands/... */
export function resolveLogo(logo: string): string {
  if (logo.startsWith("http")) return logo;
  return `/brands/${logo}`;
}

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  try {
    const existing = await brandTable.count();
    if (existing > 0) return;
    // First call with empty table — seed from static list
    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    for (let i = 0; i < BRAND_LIST.length; i++) {
      const b = BRAND_LIST[i];
      await supabase.from("brands").insert({
        id: `brand-${i}`,
        name: b.name,
        logo: b.logoFile,
        category: b.category,
        sort_order: i,
        active: 1,
      });
    }
  } catch (err) {
    console.error("Brands auto-seed error:", err);
  }
}

export async function getBrands(): Promise<BrandRow[]> {
  await ensureSeeded();
  try {
    const rows = await brandTable.list();
    if (rows.length === 0) {
      // DB empty or not configured — use static fallback
      return BRAND_LIST.map((b, i) => ({
        id: `brand-${i}`,
        name: b.name,
        logo: b.logoFile,
        category: b.category,
        sortOrder: i,
      }));
    }
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      logo: String(r.logo),
      category: r.category as BrandCategory,
      sortOrder: Number(r.sortOrder ?? 0),
    }));
  } catch (err) {
    console.error("getBrands error:", err);
    // Fallback to static list if DB fails
    return BRAND_LIST.map((b, i) => ({
      id: `brand-${i}`,
      name: b.name,
      logo: b.logoFile,
      category: b.category,
      sortOrder: i,
    }));
  }
}
