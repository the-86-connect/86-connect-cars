import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { kbDocuments } from "@/lib/db";

function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("admin-session")?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// GET /api/admin/kb/documents — list all knowledge base documents
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const docs = await kbDocuments.list();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("KB list error:", error);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}
