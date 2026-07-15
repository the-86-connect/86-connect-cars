import { NextRequest, NextResponse } from "next/server";
import { verifyUserSessionToken } from "@/lib/auth";
import { userQuotes } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user-session")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = verifyUserSessionToken(token);
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const quotes = await userQuotes.listByUser(session.userId);
  return NextResponse.json(quotes);
}
