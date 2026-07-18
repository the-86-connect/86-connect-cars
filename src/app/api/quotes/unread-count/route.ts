import { NextResponse } from "next/server";
import { quotes } from "@/lib/db";

export async function GET() {
  try {
    const count = await quotes.countNew();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
