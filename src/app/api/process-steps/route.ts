import { NextRequest, NextResponse } from "next/server";
import { processSteps } from "@/lib/db";

export async function GET() {
  try {
    const data = await processSteps.list();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch process steps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await processSteps.create(body);
    return NextResponse.json(body, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create process step" }, { status: 500 });
  }
}
