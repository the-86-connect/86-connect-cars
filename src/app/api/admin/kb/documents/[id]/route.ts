import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { replaceDocument, deleteDocument } from "@/lib/kb";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB cap matches upload route

function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("admin-session")?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// PUT /api/admin/kb/documents/[id]
// Body: multipart/form-data with new `file` (.docx) and optional `title`
// Action: delete old doc (cascade removes chunks) → process new doc → store
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const { id: docId } = await params;

    const formData = await req.formData();
    const file = formData.get("file");
    const title = (formData.get("title") as string)?.trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json({ error: "Only .docx files are supported" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_BYTES / 1024 / 1024}MB` },
        { status: 413 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await replaceDocument(
      docId,
      arrayBuffer,
      file.name,
      title || file.name.replace(/\.docx$/i, ""),
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("KB replace error:", error);
    const msg = error instanceof Error ? error.message : "Replace failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/kb/documents/[id] — hard delete doc + cascade chunks (frees storage)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const { id: docId } = await params;
    await deleteDocument(docId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("KB delete error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
