import { NextRequest, NextResponse } from "next/server";
import { testimonials } from "@/lib/db";

export async function GET() {
  try {
    const data = await testimonials.list();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `testimonial-${Date.now()}`;
    const data = { id, ...body };
    await testimonials.create(data);
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
