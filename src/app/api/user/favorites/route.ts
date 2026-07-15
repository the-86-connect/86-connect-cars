import { NextRequest, NextResponse } from "next/server";
import { verifyUserSessionToken } from "@/lib/auth";
import { favorites } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user-session")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = verifyUserSessionToken(token);
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const favs = await favorites.listByUserWithVehicle(session.userId);
  return NextResponse.json(favs);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("user-session")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = verifyUserSessionToken(token);
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "vehicleId required" }, { status: 400 });

  // Check if already favorited
  const existing = await favorites.isFavorited(session.userId, vehicleId);
  if (existing) {
    return NextResponse.json({ success: true, action: "already_favorited" });
  }

  await favorites.add(session.userId, vehicleId);
  return NextResponse.json({ success: true, action: "added" }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("user-session")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = verifyUserSessionToken(token);
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "vehicleId required" }, { status: 400 });

  await favorites.remove(session.userId, vehicleId);
  return NextResponse.json({ success: true });
}
