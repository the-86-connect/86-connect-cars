import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { brands as brandTable } from "@/lib/db";
import { ensureSeeded } from "@/lib/brands.server";

function revalidateBrandPages() {
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/inventory");
}

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "1";
    const rows = includeInactive ? await brandTable.listAll() : await brandTable.list();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Brands API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch brands", details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const logo = String(body.logo ?? "").trim();
    const category = ["chinese", "foreign", "trucks"].includes(body.category as string)
      ? (body.category as string)
      : "foreign";
    const sortOrder = Number(body.sortOrder ?? 0) || 0;
    const active = body.active === false || body.active === 0 ? 0 : 1;

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!logo) return NextResponse.json({ error: "logo is required (local filename or URL)" }, { status: 400 });

    const id = String(body.id || `brand-${Date.now()}`);
    const data = { id, name, logo, category, sortOrder, active };
    await brandTable.create(data);
    revalidateBrandPages();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Brands API POST error:", error);
    return NextResponse.json({ error: "Failed to create brand", details: String(error) }, { status: 500 });
  }
}
