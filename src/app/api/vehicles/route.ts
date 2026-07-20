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

export async function GET() {
  try {
    const data = await vehicles.list();
    // Parse JSON fields and normalize image/images
    const parsed = data.map((v) => {
      const mainImage = (v.image as string) || "";
      const galleryImages =
        typeof v.images === "string" ? JSON.parse(v.images as string) : v.images || [];
      const images =
        galleryImages.length > 0
          ? galleryImages
          : mainImage
            ? [mainImage]
            : [];
      return {
        ...v,
        image: mainImage || images[0] || "",
        images,
        specs: typeof v.specs === "string" ? JSON.parse(v.specs as string) : v.specs,
        features: typeof v.features === "string" ? JSON.parse(v.features as string) : v.features,
        colors: typeof v.colors === "string" ? JSON.parse(v.colors as string) : v.colors,
        exportDocs: typeof v.exportDocs === "string" ? JSON.parse(v.exportDocs as string) : v.exportDocs,
      };
    });
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Vehicles API error:", e);
    return NextResponse.json({ error: "Failed to fetch vehicles", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.slug || `vehicle-${Date.now()}`;
    const slug = body.slug || body.model?.toLowerCase().replace(/\s+/g, "-") || id;

    const data = {
      id,
      slug,
      brand: body.brand || "",
      model: body.model || "",
      year: body.year || new Date().getFullYear(),
      price: body.price || 0,
      fuel: body.fuel || "Petrol",
      bodyType: body.bodyType || "SUV",
      transmission: body.transmission || "Automatic",
      condition: body.condition || "New",
      availability: body.availability || "In Stock",
      image: body.image || "",
      images: JSON.stringify(body.images || []),
      video: body.video || null,
      badge: body.badge || null,
      engine: body.engine || null,
      description: body.description || "",
      specs: JSON.stringify(body.specs || {}),
      features: JSON.stringify(body.features || []),
      colors: JSON.stringify(body.colors || []),
      mileage: body.mileage || null,
      fobPrice: body.fobPrice || null,
      portOfLoading: body.portOfLoading || null,
      handDrive: body.handDrive || null,
      shippingEstimate: body.shippingEstimate || null,
      exportDocs: JSON.stringify(body.exportDocs || []),
    };

    await vehicles.create(data);
    revalidateVehiclePages();
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
