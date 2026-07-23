import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/db";

export async function GET() {
  try {
    const data = await features.list();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `feature-${Date.now()}`;
    const data = { id, ...body };
    await features.create(data);
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await features.update(id, updates);
    return NextResponse.json({ id, ...updates });
  } catch {
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}
