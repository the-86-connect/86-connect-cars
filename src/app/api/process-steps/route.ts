import { NextRequest, NextResponse } from "next/server";
import { processSteps } from "@/lib/db";

export async function GET() {
  try {
    const data = await processSteps.list();
    // process_steps PK is `step` (integer), not `id`. Inject id=String(step)
    // so the standard CrudPage (which uses item.id) works unchanged.
    const withId = (Array.isArray(data) ? data : []).map((row) => ({
      ...row,
      id: String(row.step),
    }));
    return NextResponse.json(withId);
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    // id is the step number as a string (injected by GET)
    const step = Number(id);
    if (Number.isNaN(step)) return NextResponse.json({ error: "Invalid step id" }, { status: 400 });
    await processSteps.update(step, updates);
    return NextResponse.json({ id, ...updates });
  } catch {
    return NextResponse.json({ error: "Failed to update process step" }, { status: 500 });
  }
}
