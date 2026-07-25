import { NextRequest, NextResponse } from "next/server";
import { processSteps } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Hard delete — permanent removal, no soft-delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth) return auth;
  try {
    const { id } = await params;
    const step = Number(id);
    if (Number.isNaN(step)) return NextResponse.json({ error: "Invalid step id" }, { status: 400 });
    await processSteps.delete(step);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete process step" }, { status: 500 });
  }
}
