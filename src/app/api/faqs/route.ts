import { NextRequest, NextResponse } from "next/server";
import { faqs } from "@/lib/db";

export async function GET() {
  try {
    const data = await faqs.list();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `faq-${Date.now()}`;
    const data = { id, ...body };
    await faqs.create(data);
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
