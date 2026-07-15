import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/db";
import { hashPassword, createUserSessionToken } from "@/lib/auth";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { name, email, password, whatsapp, country } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    }

    const existing = await users.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const passwordHash = hashPassword(password);

    await users.create({ id, name, email, passwordHash, whatsapp: whatsapp || null, country: country || null });

    const token = createUserSessionToken(id, email);
    const response = NextResponse.json({ success: true, id, name, email });
    response.cookies.set("user-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
