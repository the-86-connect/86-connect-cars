import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// DELETE /api/admin/users/[id]            — delete user + their quotes + favorites (cascade)
// DELETE /api/admin/users/[id]?dataOnly=1 — delete only the user's quotes + favorites, keep the account
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dataOnly = req.nextUrl.searchParams.get("dataOnly") === "1";
    const supabase = getSupabaseAdmin();

    await supabase.from("favorites").delete().eq("user_id", id);
    await supabase.from("quotes").delete().eq("user_id", id);

    if (!dataOnly) {
      await supabase.from("users").delete().eq("id", id);
    }

    return NextResponse.json({ success: true, dataOnly });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
