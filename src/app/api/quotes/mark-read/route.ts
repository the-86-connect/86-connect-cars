import { NextRequest, NextResponse } from "next/server";
import { quotes } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;
  try {
    await quotes.markNewAsRead();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to mark quotes as read" }, { status: 500 });
  }
}
