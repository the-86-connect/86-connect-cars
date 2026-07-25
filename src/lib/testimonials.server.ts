/**
 * Server-only testimonial accessors — reads from Supabase via lib/db.
 * Auto-seeds the testimonials table from static data on first call if empty.
 * Admin can add/edit/delete via /admin/testimonials (hard deletes).
 */
import "server-only";
import { testimonials as testimonialTable } from "@/lib/db";
import { testimonials as staticTestimonials } from "@/lib/data";
import type { Testimonial } from "@/types";

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  try {
    const rows = await testimonialTable.list();
    if (rows.length === 0) {
      for (const t of staticTestimonials) {
        await testimonialTable.create(t as unknown as Record<string, unknown>);
      }
    }
  } catch (error) {
    console.error("testimonials seed error:", error);
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  await ensureSeeded();
  try {
    const rows = await testimonialTable.list();
    return rows as unknown as Testimonial[];
  } catch (error) {
    console.error("getTestimonials error:", error);
    return [];
  }
}
