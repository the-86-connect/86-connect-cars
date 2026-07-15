import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { gallery } from "@/lib/db";
import { normalizeGalleryPayload } from "@/lib/gallery.server";

/** Revalidate public pages that show the gallery. */
function revalidateGalleryPages() {
  revalidatePath("/");
  revalidatePath("/gallery");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "1";
    const rows = includeInactive ? await gallery.listAll() : await gallery.list();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Gallery API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery", details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const normalized = normalizeGalleryPayload(body);
    if (!normalized.src) {
      return NextResponse.json(
        { error: "src is required (Cloudinary URL for photos, YouTube URL/ID for videos)" },
        { status: 400 },
      );
    }
    const id = String(body.id || `gallery-${Date.now()}`);
    const data = { id, ...normalized };
    await gallery.create(data);
    revalidateGalleryPages();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Gallery API POST error:", error);
    return NextResponse.json({ error: "Failed to create gallery item", details: String(error) }, { status: 500 });
  }
}
