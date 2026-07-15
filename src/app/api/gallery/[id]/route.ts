import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { gallery } from "@/lib/db";
import { normalizeGalleryPayload } from "@/lib/gallery.server";

function revalidateGalleryPages() {
  revalidatePath("/");
  revalidatePath("/gallery");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = await gallery.find(id);
    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery item" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const normalized = normalizeGalleryPayload(body);
    if (!normalized.src) {
      return NextResponse.json({ error: "src is required" }, { status: 400 });
    }
    await gallery.update(id, normalized);
    revalidateGalleryPages();
    return NextResponse.json({ id, ...normalized });
  } catch (error) {
    console.error("Gallery API PUT error:", error);
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await gallery.delete(id);
    revalidateGalleryPages();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
