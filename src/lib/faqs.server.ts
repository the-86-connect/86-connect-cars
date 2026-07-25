/**
 * Server-only FAQ accessors — reads from Supabase via lib/db.
 * Admin can add/edit/delete via /admin/faqs (hard deletes).
 * If DB is empty, returns [] — section is hidden on frontend.
 */
import "server-only";
import { faqs as faqTable } from "@/lib/db";
import type { FAQItem } from "@/types";

export async function getFaqs(): Promise<FAQItem[]> {
  try {
    const rows = await faqTable.list();
    return rows as unknown as FAQItem[];
  } catch (error) {
    console.error("getFaqs error:", error);
    return [];
  }
}
