import { NextRequest, NextResponse } from "next/server";
import { admins } from "@/lib/db";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = await admins.findByEmail(email);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    if (admin.passwordHash !== passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({ success: true, email, role: admin.role });
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
