import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword, createSessionToken } from "@/lib/auth";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { data: admin, error } = await adminClient
      .from("admins")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!verifyPassword(password, admin.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken(admin.id, admin.email);
    const response = NextResponse.json({ success: true, email: admin.email, role: admin.role });
    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}