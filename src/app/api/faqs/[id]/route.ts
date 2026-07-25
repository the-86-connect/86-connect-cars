import { NextRequest, NextResponse } from "next/server";
import { faqs } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Hard delete — permanent removal, no soft-delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth) return auth;
  try {
    const { id } = await params;
    await faqs.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
