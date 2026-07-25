import { NextRequest, NextResponse } from "next/server";
import { testimonials } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Hard delete — permanent removal, no soft-delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth) return auth;
  try {
    const { id } = await params;
    await testimonials.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
