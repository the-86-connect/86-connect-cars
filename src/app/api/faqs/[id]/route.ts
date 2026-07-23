import { NextRequest, NextResponse } from "next/server";
import { faqs } from "@/lib/db";

// Hard delete — permanent removal, no soft-delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await faqs.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
