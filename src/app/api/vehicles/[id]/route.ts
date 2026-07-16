import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { vehicles } from "@/lib/db";

/** Revalidate all public pages that display vehicles. */
function revalidateVehiclePages() {
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/inventory/[slug]", "page");
  revalidatePath("/brands");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await vehicles.find(id);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    // Parse JSON fields
    const parsed = {
      ...vehicle,
      images: typeof vehicle.images === "string" ? JSON.parse(vehicle.images as string) : vehicle.images,
      specs: typeof vehicle.specs === "string" ? JSON.parse(vehicle.specs as string) : vehicle.specs,
      features: typeof vehicle.features === "string" ? JSON.parse(vehicle.features as string) : vehicle.features,
      colors: typeof vehicle.colors === "string" ? JSON.parse(vehicle.colors as string) : vehicle.colors,
      exportDocs: typeof vehicle.exportDocs === "string" ? JSON.parse(vehicle.exportDocs as string) : vehicle.exportDocs,
    };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Stringify JSON fields
    const data: Record<string, unknown> = { ...body };
    if (body.images) data.images = JSON.stringify(body.images);
    if (body.specs) data.specs = JSON.stringify(body.specs);
    if (body.features) data.features = JSON.stringify(body.features);
    if (body.colors) data.colors = JSON.stringify(body.colors);
    if (body.exportDocs) data.exportDocs = JSON.stringify(body.exportDocs);
    data.updatedAt = new Date().toISOString();

    await vehicles.update(id, data);
    revalidateVehiclePages();
    return NextResponse.json({ id, ...data });
  } catch {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await vehicles.delete(id);
    revalidateVehiclePages();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
