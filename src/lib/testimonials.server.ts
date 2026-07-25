/**
 * Server-only testimonial accessors — reads from Supabase via lib/db.
 * Admin can add/edit/delete via /admin/testimonials (hard deletes).
 * If DB is empty, returns [] — section is hidden on frontend.
 */
import "server-only";
import { testimonials as testimonialTable } from "@/lib/db";
import type { Testimonial } from "@/types";

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const rows = await testimonialTable.list();
    return rows as unknown as Testimonial[];
  } catch (error) {
    console.error("getTestimonials error:", error);
    return [];
  }
}
