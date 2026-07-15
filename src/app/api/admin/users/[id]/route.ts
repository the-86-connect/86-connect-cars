import { NextRequest, NextResponse } from "next/server";
import { getSqliteDb, sqliteRun } from "@/lib/db/sqlite";

// DELETE /api/admin/users/[id]            — delete user + their quotes + favorites (cascade)
// DELETE /api/admin/users/[id]?dataOnly=1 — delete only the user's quotes + favorites, keep the account
// ponytail: SQLite doesn't enforce FK CASCADE on these tables, so we delete manually.
// Upgrade path: add ON DELETE CASCADE to the FK constraints in schema.ts and drop the manual deletes.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dataOnly = req.nextUrl.searchParams.get("dataOnly") === "1";
    const db = await getSqliteDb();

    // Always delete related data first (frees hosting storage)
    sqliteRun(db, "DELETE FROM favorites WHERE userId = ?", [id]);
    sqliteRun(db, "DELETE FROM quotes WHERE userId = ?", [id]);

    if (!dataOnly) {
      sqliteRun(db, "DELETE FROM users WHERE id = ?", [id]);
    }

    return NextResponse.json({ success: true, dataOnly });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
