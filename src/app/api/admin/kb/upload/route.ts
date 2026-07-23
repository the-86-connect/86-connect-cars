import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { upsertDocument, getKbProviderInfo } from "@/lib/kb";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB .docx cap — chunks+embeddings dominate DB, not source

function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("admin-session")?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// POST /api/admin/kb/upload
// Body: multipart/form-data with `file` (.docx) and optional `title`
// Action: parse → chunk → GLM embed → store in pgvector. Source .docx is discarded.
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const provider = getKbProviderInfo();
    if (!provider.configured) {
      return NextResponse.json(
        { error: `No AI provider configured. Set ZHIPU_API_KEY or OPENAI_API_KEY in environment variables.` },
        { status: 500 },
      );
    }

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
    const result = await upsertDocument(
      arrayBuffer,
      file.name,
      title || file.name.replace(/\.docx$/i, ""),
    );

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("KB upload error:", error);
    const msg = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
