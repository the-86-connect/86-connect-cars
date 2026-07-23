import { NextRequest, NextResponse } from "next/server";
import { processSteps } from "@/lib/db";

// Hard delete — permanent removal, no soft-delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
