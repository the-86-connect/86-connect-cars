import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function notifyMainAdminDelete(quoteId: string, hard: boolean): Promise<void> {
  const adminApiUrl = process.env.MAIN_ADMIN_CAR_QUOTE_API;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!adminApiUrl || !webhookSecret) return;

  const deleteUrl = `${adminApiUrl}/${encodeURIComponent(quoteId)}?hard=${hard ? "true" : "false"}`;
  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${webhookSecret}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return; // already deleted — not an error
    if (!response.ok) console.error(`Main admin delete webhook failed: ${response.status} for quote ${quoteId}`);
  } catch (error) {
    console.error(`Main admin delete webhook error for quote ${quoteId}:`, (error as Error).message);
  }
}

// DELETE /api/admin/users/[id]            — delete user + their quotes + favorites (cascade)
// DELETE /api/admin/users/[id]?dataOnly=1 — delete only the user's quotes + favorites, keep the account
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dataOnly = req.nextUrl.searchParams.get("dataOnly") === "1";
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

    // Before deleting quotes, fetch all quote IDs for this user
    const { data: userQuotes } = await supabase.from("quotes").select("id").eq("user_id", id);
    const quoteIds = (userQuotes || []).map((q) => q.id);

    await supabase.from("favorites").delete().eq("user_id", id);
    await supabase.from("quotes").delete().eq("user_id", id);

    if (!dataOnly) {
      await supabase.from("users").delete().eq("id", id);
    }

    // After deletion, notify main admin panel for each quote (soft delete)
    // Always pass hard=false — the admin panel handles its own hard-delete via purge
    if (quoteIds.length > 0) {
      Promise.allSettled(
        quoteIds.map((quoteId) => notifyMainAdminDelete(quoteId, false))
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, dataOnly });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
