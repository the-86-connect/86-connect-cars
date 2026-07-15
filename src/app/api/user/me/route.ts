import { NextRequest, NextResponse } from "next/server";
import { verifyUserSessionToken } from "@/lib/auth";
import { users } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user-session")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = verifyUserSessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await users.find(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    id: user.id,
    name: user.name,
    email: user.email,
    whatsapp: user.whatsapp,
    country: user.country,
  });
}
