import { NextResponse } from "next/server";
import { quotes } from "@/lib/db";

export async function POST() {
  try {
    await quotes.markNewAsRead();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to mark quotes as read" }, { status: 500 });
  }
}
