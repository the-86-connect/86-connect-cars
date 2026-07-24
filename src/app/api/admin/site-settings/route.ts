import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { siteSettings } from "@/lib/db";

function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("admin-session")?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const patch: { chatbotEnabled?: boolean } = {};
    if (typeof body.chatbotEnabled === "boolean") patch.chatbotEnabled = body.chatbotEnabled;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    const settings = await siteSettings.update(patch);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Site settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
