/**
 * Server-only FAQ accessors — reads from Supabase via lib/db.
 * Auto-seeds the faqs table from static data on first call if empty.
 * Admin can add/edit/delete via /admin/faqs (hard deletes).
 */
import "server-only";
import { faqs as faqTable } from "@/lib/db";
import { faqs as staticFaqs } from "@/lib/data";
import type { FAQItem } from "@/types";

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  try {
    const rows = await faqTable.list();
    if (rows.length === 0) {
      for (const f of staticFaqs) {
        await faqTable.create(f as unknown as Record<string, unknown>);
      }
    }
  } catch (error) {
    console.error("faqs seed error:", error);
  }
}

export async function getFaqs(): Promise<FAQItem[]> {
  await ensureSeeded();
  try {
    const rows = await faqTable.list();
    return rows as unknown as FAQItem[];
  } catch (error) {
    console.error("getFaqs error:", error);
    return [];
  }
}
