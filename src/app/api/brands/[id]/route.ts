import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { brands as brandTable } from "@/lib/db";

function revalidateBrandPages() {
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/inventory");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await brandTable.find(id);
    if (!item) return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.logo !== undefined) data.logo = String(body.logo).trim();
    if (body.category !== undefined) {
      data.category = ["chinese", "foreign", "trucks"].includes(body.category as string)
        ? body.category
        : "foreign";
    }
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
    if (body.active !== undefined) data.active = body.active === false || body.active === 0 ? 0 : 1;

    if (data.name === "") return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    if (data.logo === "") return NextResponse.json({ error: "logo cannot be empty" }, { status: 400 });

    await brandTable.update(id, data);
    revalidateBrandPages();
    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Brands API PUT error:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await brandTable.delete(id);
    revalidateBrandPages();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
