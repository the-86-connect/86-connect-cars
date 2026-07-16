import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth";

// GET /api/admin/users — list all registered users with their quote counts
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: userRows, error: userError } = await supabase
      .from("users")
      .select("id, name, email, whatsapp, country, created_at")
      .order("created_at", { ascending: false });
    if (userError) throw userError;

    const { data: quoteRows, error: quoteError } = await supabase
      .from("quotes")
      .select("user_id");
    if (quoteError) throw quoteError;

    const { data: favRows, error: favError } = await supabase
      .from("favorites")
      .select("user_id");
    if (favError) throw favError;

    const quoteCountMap = new Map<string, number>();
    for (const row of quoteRows ?? []) {
      const uid = row.user_id as string;
      quoteCountMap.set(uid, (quoteCountMap.get(uid) ?? 0) + 1);
    }
    const favCountMap = new Map<string, number>();
    for (const row of favRows ?? []) {
      const uid = row.user_id as string;
      favCountMap.set(uid, (favCountMap.get(uid) ?? 0) + 1);
    }

    const result = (userRows ?? []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      whatsapp: u.whatsapp,
      country: u.country,
      createdAt: u.created_at,
      quoteCount: quoteCountMap.get(u.id as string) ?? 0,
      favoriteCount: favCountMap.get(u.id as string) ?? 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users — admin creates a new user
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, whatsapp, country } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await users.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const passwordHash = hashPassword(password);
    await users.create({
      id,
      name,
      email,
      passwordHash,
      whatsapp: whatsapp || null,
      country: country || null,
    });

    return NextResponse.json({ success: true, id, name, email }, { status: 201 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
