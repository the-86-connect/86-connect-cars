import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/db";
import { hashPassword, createUserSessionToken } from "@/lib/auth";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await users.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createUserSessionToken(user.id as string, email);
    const response = NextResponse.json({ success: true, id: user.id, name: user.name, email });
    response.cookies.set("user-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
