import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { favorites } from "@/lib/db";

async function getCurrentUser(req: NextRequest): Promise<{ id: string; email: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !key) return null;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll() {},
    },
  });

  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const favs = await favorites.listByUserWithVehicle(user.id);
  return NextResponse.json(favs);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "vehicleId required" }, { status: 400 });

  const existing = await favorites.isFavorited(user.id, vehicleId);
  if (existing) {
    return NextResponse.json({ success: true, action: "already_favorited" });
  }

  await favorites.add(user.id, vehicleId);
  return NextResponse.json({ success: true, action: "added" }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "vehicleId required" }, { status: 400 });

  await favorites.remove(user.id, vehicleId);
  return NextResponse.json({ success: true });
}
